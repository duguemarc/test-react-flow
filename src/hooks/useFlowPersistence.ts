// hooks/useFlowPersistence.ts
import { useCallback } from 'react';
import type {Node, Edge} from '@xyflow/react';
import type {SimulationLogEntry, WorkflowNodeData} from "../types/WorkflowSimulationTypes.ts";

const STORAGE_KEYS = {
  NODES: 'workflow-nodes',
  EDGES: 'workflow-edges',
  SIMULATION_LOG: 'workflow-simulation-log',
  LAST_SAVED: 'workflow-last-saved'
};

export const useFlowPersistence = () => {
  // Sauvegarde des nœuds et edges
  const saveFlow = useCallback((
    nodes: Node<WorkflowNodeData>[], 
    edges: Edge[]
  ) => {
    try {
      localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
      localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(edges));
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
      
      console.log('Flow sauvegardé dans localStorage');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }, []);

  // Chargement du flow
  const loadFlow = useCallback(() => {
    try {
      const nodes = localStorage.getItem(STORAGE_KEYS.NODES);
      const edges = localStorage.getItem(STORAGE_KEYS.EDGES);
      
      return {
        nodes: nodes ? JSON.parse(nodes) : [],
        edges: edges ? JSON.parse(edges) : []
      };
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      return { nodes: [], edges: [] };
    }
  }, []);

  // Sauvegarde du log de simulation
  const saveSimulationLog = useCallback((log: SimulationLogEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SIMULATION_LOG, JSON.stringify(log));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du log:', error);
    }
  }, []);

  // Chargement du log de simulation
  const loadSimulationLog = useCallback((): SimulationLogEntry[] => {
    try {
      const log = localStorage.getItem(STORAGE_KEYS.SIMULATION_LOG);
      return log ? JSON.parse(log) : [];
    } catch (error) {
      console.error('Erreur lors du chargement du log:', error);
      return [];
    }
  }, []);

  // Nettoyage
  const clearFlow = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('Flow effacé du localStorage');
  }, []);

  // Vérification de l'existence d'une sauvegarde
  const hasSavedFlow = useCallback(() => {
    return localStorage.getItem(STORAGE_KEYS.NODES) !== null;
  }, []);

  // Obtenir la date de dernière sauvegarde
  const getLastSavedDate = useCallback(() => {
    const lastSaved = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
    return lastSaved ? new Date(lastSaved) : null;
  }, []);

  return {
    saveFlow,
    loadFlow,
    saveSimulationLog,
    loadSimulationLog,
    clearFlow,
    hasSavedFlow,
    getLastSavedDate
  };
};
