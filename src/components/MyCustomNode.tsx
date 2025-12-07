import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

export type StepType = 'start' | 'sms' | 'email' | 'custom' | 'end';

export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failure';

export type MyCustomNodeData = {
    name: string;
    stepType: StepType;
    description: string;
    status?: ExecutionStatus;
};

export type MyCustomNodeType = Node<MyCustomNodeData, 'custom'>;

const getStepIcon = (stepType: StepType): string => {
    switch (stepType) {
        case 'start':
            return '▶️';
        case 'sms':
            return '📱';
        case 'email':
            return '📧';
        case 'custom':
            return '⚙️';
        case 'end':
            return '🏁';
        default:
            return '❓';
    }
};

const getStatusColor = (status?: ExecutionStatus): string => {
    switch (status) {
        case 'running':
            return 'border-yellow-500 bg-yellow-50';
        case 'success':
            return 'border-green-500 bg-green-50';
        case 'failure':
            return 'border-red-500 bg-red-50';
        default:
            return 'border-gray-200 bg-white';
    }
};

export default function MyCustomNode({ data, selected }: NodeProps<MyCustomNodeType>) {
    const statusColor = getStatusColor(data.status);
    const selectedStyle = selected ? 'border-blue-500 shadow-lg' : '';

    return (
        <div className={`px-4 py-3 shadow-md rounded-md border-2 transition-all min-w-32 ${statusColor} ${selectedStyle}`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3" />
            
            <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getStepIcon(data.stepType)}</span>
                <div className="font-medium text-gray-900 text-sm">{data.name}</div>
            </div>
            
            <div className="text-xs text-gray-500 capitalize">{data.stepType}</div>
            
            {data.status && (
                <div className="mt-2 text-xs font-medium">
                    {data.status === 'running' && 'En cours...'}
                    {data.status === 'success' && 'Succès'}
                    {data.status === 'failure' && 'Échec'}
                </div>
            )}
            
            <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        </div>
    );
}