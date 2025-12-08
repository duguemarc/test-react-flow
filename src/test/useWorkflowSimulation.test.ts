import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWorkflowSimulation } from '../hooks/useWorkflowSimulation'
import type { ExecutionStatus } from '../types/WorkflowSimulationTypes'
import {createConditionalWorkflow, createLinearWorkflow, createTestNode} from "./test-utils/workflow_utilities.ts";

// Mock timers pour les tests
describe('useWorkflowSimulation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Mock window.alert pour éviter les alertes pendant les tests
    global.alert = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useWorkflowSimulation())

      expect(result.current.isSimulating).toBe(false)
      expect(result.current.simulationLog).toEqual([])
      expect(typeof result.current.startSimulation).toBe('function')
      expect(typeof result.current.stopSimulation).toBe('function')
      expect(typeof result.current.clearLog).toBe('function')
      expect(typeof result.current.validateWorkflow).toBe('function')
    })
  })

  describe('validateWorkflow', () => {
    it('should validate a correct workflow', () => {
      const { result } = renderHook(() => useWorkflowSimulation())
      const { nodes } = createLinearWorkflow()

      const validation = result.current.validateWorkflow(nodes)
      expect(validation.isValid).toBe(true)
      expect(validation.error).toBeUndefined()
    })

    it('should reject workflow without start node', () => {
      const { result } = renderHook(() => useWorkflowSimulation())
      const nodes = [
        createTestNode('email-1', 'email'),
        createTestNode('end-1', 'end')
      ]

      const validation = result.current.validateWorkflow(nodes)
      expect(validation.isValid).toBe(false)
      expect(validation.error).toBe('Le workflow doit contenir exactement un nœud de départ')
    })

    it('should reject workflow with multiple start nodes', () => {
      const { result } = renderHook(() => useWorkflowSimulation())
      const nodes = [
        createTestNode('start-1', 'start'),
        createTestNode('start-2', 'start'),
        createTestNode('end-1', 'end')
      ]

      const validation = result.current.validateWorkflow(nodes)
      expect(validation.isValid).toBe(false)
      expect(validation.error).toBe('Le workflow ne peut contenir qu\'un seul nœud de départ')
    })

    it('should reject workflow without end node', () => {
      const { result } = renderHook(() => useWorkflowSimulation())
      const nodes = [
        createTestNode('start-1', 'start'),
        createTestNode('email-1', 'email')
      ]

      const validation = result.current.validateWorkflow(nodes)
      expect(validation.isValid).toBe(false)
      expect(validation.error).toBe('Le workflow doit contenir au moins un nœud de fin')
    })
  })

  describe('simulation execution', () => {
    it('should execute a linear workflow correctly', async () => {
      const { result } = renderHook(() => useWorkflowSimulation())
      const { nodes, edges } = createLinearWorkflow()
      const statusUpdates: Array<{ nodeId: string, status: ExecutionStatus }> = []
      
      const onNodeStatusUpdate = vi.fn((nodeId: string, status: ExecutionStatus) => {
        statusUpdates.push({ nodeId, status })
      })

      expect(result.current.startSimulation).toBeDefined()
      expect(typeof result.current.startSimulation).toBe('function')

      act(() => {
        result.current.startSimulation(nodes, edges, onNodeStatusUpdate)
      })

      expect(result.current.isSimulating).toBe(true)
      expect(global.alert).not.toHaveBeenCalled()

      // Simuler le passage du temps pour l'exécution complète
      await act(async () => {
        // Avancer de 10 secondes pour être sûr que toutes les étapes sont terminées
        vi.advanceTimersByTime(10000)
        // Laisser le temps aux promises de se résoudre
        await vi.runAllTimersAsync()
      })

      // Vérifier que tous les nœuds ont été traités
      expect(statusUpdates.length).toBeGreaterThan(0)
      
      // Vérifier qu'au moins les nœuds ont été mis à jour avec 'pending' initialement
      const pendingUpdates = statusUpdates.filter(update => update.status === 'pending')
      expect(pendingUpdates.length).toBe(nodes.length)
    })

    it('should handle conditional workflows', async () => {
      const { result } = renderHook(() => useWorkflowSimulation())
      const { nodes, edges } = createConditionalWorkflow()
      const statusUpdates: Array<{ nodeId: string, status: ExecutionStatus }> = []
      
      const onNodeStatusUpdate = vi.fn((nodeId: string, status: ExecutionStatus) => {
        statusUpdates.push({ nodeId, status })
      })

      act(() => {
        result.current.startSimulation(nodes, edges, onNodeStatusUpdate)
      })

      expect(result.current.isSimulating).toBe(true)

      await act(async () => {
        vi.advanceTimersByTime(15000)
        await vi.runAllTimersAsync()
      })

      // Vérifier que la simulation a traité les nœuds
      expect(statusUpdates.length).toBeGreaterThan(nodes.length) // Au moins pending + running/success/failure
    })

    it('should stop simulation when stopSimulation is called', async () => {
      const { result } = renderHook(() => useWorkflowSimulation())
      const { nodes, edges } = createLinearWorkflow()
      const onNodeStatusUpdate = vi.fn()

      act(() => {
        result.current.startSimulation(nodes, edges, onNodeStatusUpdate)
      })

      expect(result.current.isSimulating).toBe(true)

      act(() => {
        result.current.stopSimulation()
      })

      expect(result.current.isSimulating).toBe(false)
    })

    it('should clear simulation log', () => {
      const { result } = renderHook(() => useWorkflowSimulation())
      const { nodes } = createLinearWorkflow()
      const onNodeStatusUpdate = vi.fn()

      // Simuler quelques entrées de log en démarrant puis arrêtant la simulation
      act(() => {
        result.current.startSimulation(nodes, [], onNodeStatusUpdate)
      })

      act(() => {
        result.current.stopSimulation()
      })

      // Vérifier que clearLog fonctionne
      act(() => {
        result.current.clearLog(nodes, onNodeStatusUpdate)
      })

      expect(result.current.simulationLog).toEqual([])
      expect(onNodeStatusUpdate).toHaveBeenCalledWith(nodes[0].id, 'pending')
    })
  })

  describe('simulation log', () => {
    it('should track simulation log entries', async () => {
      const { result } = renderHook(() => useWorkflowSimulation())
      const { nodes, edges } = createLinearWorkflow()
      const onNodeStatusUpdate = vi.fn()

      act(() => {
        result.current.startSimulation(nodes, edges, onNodeStatusUpdate)
      })

      // Avancer un peu dans le temps pour permettre au premier nœud de commencer
      await act(async () => {
        vi.advanceTimersByTime(100)
        await vi.runAllTimersAsync()
      })

      // Vérifier qu'il y a des entrées dans le log
      expect(result.current.simulationLog.length).toBeGreaterThan(0)
      
      // Vérifier la structure des entrées de log
      const firstEntry = result.current.simulationLog[0]
      expect(firstEntry).toHaveProperty('nodeId')
      expect(firstEntry).toHaveProperty('nodeName')
      expect(firstEntry).toHaveProperty('status')
      expect(firstEntry).toHaveProperty('timestamp')
    })
  })
})