import type {ExecutionStatus, StepType} from "../types/WorkflowSimulationTypes.ts";

export const getStepIcon = (stepType: StepType): string => {
    const iconMap: Record<StepType, string> = {
        start: '▶️',
        sms: '📱',
        email: '📧',
        custom: '⚙️',
        end: '🏁',
    };
    return iconMap[stepType] || '❓';
};

export const getStatusColor = (status?: ExecutionStatus): string => {
    const colorMap: Record<ExecutionStatus, string> = {
        pending: 'border-gray-200 bg-white',
        running: 'border-yellow-500 bg-yellow-50',
        success: 'border-green-500 bg-green-50',
        failure: 'border-red-500 bg-red-50',
    };
    return colorMap[status || 'pending'];
};

export const getStatusLabel = (status?: ExecutionStatus): string => {
    const labelMap: Record<ExecutionStatus, string> = {
        pending: '',
        running: '⏳ En cours...',
        success: '✅ Succès',
        failure: '❌ Échec',
    };
    return labelMap[status || 'pending'];
};

export const canHaveConditionalOutputs = (stepType: StepType): boolean => {
    return !['start', 'end'].includes(stepType);
};

export const needsInput = (stepType: StepType): boolean => {
    return stepType !== 'start';
};

export const needsOutput = (stepType: StepType): boolean => {
    return stepType !== 'end';
};
