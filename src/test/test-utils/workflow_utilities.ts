import type { Edge } from '@xyflow/react'
import type {StepType, WorkflowNodeData} from "../../types/WorkflowSimulationTypes.ts";
import type {WorkflowNodeType} from "../../hooks/useWorkflowState.ts";

export const createTestNode = (
  id: string,
  stepType: StepType,
  overrides: Partial<WorkflowNodeData> = {}
): WorkflowNodeType => ({
  id,
  type: 'workflow',
  position: { x: 0, y: 0 },
  data: {
    name: `Test ${stepType}`,
    stepType,
    description: `Test node for ${stepType}`,
    ...overrides
  }
})

export const createTestEdge = (
  id: string,
  source: string,
  target: string,
  sourceHandle = 'default',
  targetHandle = 'input'
): Edge => ({
  id,
  source,
  target,
  sourceHandle,
  targetHandle
})

export const createLinearWorkflow = (): { nodes: WorkflowNodeType[], edges: Edge[] } => {
  const nodes = [
    createTestNode('start-1', 'start'),
    createTestNode('email-1', 'email'),
    createTestNode('end-1', 'end')
  ]

  const edges = [
    createTestEdge('start-email', 'start-1', 'email-1'),
    createTestEdge('email-end', 'email-1', 'end-1')
  ]

  return { nodes, edges }
}

export const createConditionalWorkflow = (): { nodes: WorkflowNodeType[], edges: Edge[] } => {
  const nodes = [
    createTestNode('start-1', 'start'),
    createTestNode('email-1', 'email', { hasConditionalOutputs: true }),
    createTestNode('sms-success', 'sms'),
    createTestNode('end-failure', 'end'),
    createTestNode('end-success', 'end')
  ]

  const edges = [
    createTestEdge('start-email', 'start-1', 'email-1'),
    createTestEdge('email-sms', 'email-1', 'sms-success', 'success'),
    createTestEdge('email-failure', 'email-1', 'end-failure', 'failure'),
    createTestEdge('sms-end', 'sms-success', 'end-success')
  ]

  return { nodes, edges }
}
