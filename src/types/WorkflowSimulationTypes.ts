
export type StepType = 'start' | 'sms' | 'email' | 'custom' | 'end';

export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failure';

export type TransitionType = 'success' | 'failure' | 'default';

export type WorkflowNodeData = {
    name: string;
    stepType: StepType;
    description?: string;
    status?: ExecutionStatus;
    hasConditionalOutputs?: boolean;
}

export interface WorkflowEdgeData {
    transitionType: TransitionType;
}

export interface SimulationLogEntry {
    nodeId: string;
    nodeName: string;
    status: ExecutionStatus;
    timestamp: Date;
    duration?: number;
}
