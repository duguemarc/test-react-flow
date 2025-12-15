import {Handle, Position, type NodeProps, useUpdateNodeInternals} from '@xyflow/react';
import {
    hasConditionalOutputsByType,
    getStatusColor,
    getStatusLabel,
    getStepIcon,
    needsInput,
    needsOutput
} from "../utils/step_utils.ts";
import { twMerge } from 'tailwind-merge';
import type {WorkflowNodeType} from "../hooks/useWorkflowState.ts";
import { useEffect } from 'react';

export default function WorkflowNode({ data, selected, id }: NodeProps<WorkflowNodeType>) {
    const updateNodeInternals = useUpdateNodeInternals();
    const statusColor = getStatusColor(data.status);
    const selectedStyle = selected ? 'border-blue-500 shadow-lg' : '';
    
    // Les sorties conditionnelles sont déterminées automatiquement par le type
    const hasConditionalOutputs = hasConditionalOutputsByType(data.stepType);
    const showInput = needsInput(data.stepType);
    const showOutput = needsOutput(data.stepType);


    useEffect(() => {
        updateNodeInternals(id);
    }, [id, data.stepType, updateNodeInternals]);
    return (
        <div
            className={twMerge(
                "px-4 py-3 shadow-md rounded-md border-2 transition-all min-w-32",
                statusColor,
                selectedStyle
            )}
        >
            {showInput && (
                <Handle 
                    type="target" 
                    position={Position.Top} 
                    className="w-3 h-3"
                    id="input"
                />
            )}
            
            <div className="flex items-center gap-2 mb-1">
                <span className="text-lg" role="img" aria-label={data.stepType}>
                    {getStepIcon(data.stepType)}
                </span>
                <div className="font-medium text-gray-900 text-sm">{data.name}</div>
            </div>
            
            <div className="text-xs text-gray-500 capitalize">{data.stepType}</div>
            
            {data.status && (
                <div className="mt-2 text-xs font-medium">
                    {getStatusLabel(data.status)}
                </div>
            )}
            
            {showOutput && (
                <>
                    {hasConditionalOutputs ? (
                        <div className="relative">
                            <Handle 
                                type="source" 
                                position={Position.Bottom} 
                                className="w-3 h-3 bg-green-500"
                                id="success"
                                style={{ left: '25%' }}
                            />
                            <Handle 
                                type="source" 
                                position={Position.Bottom} 
                                className="w-3 h-3 bg-red-500"
                                id="failure"
                                style={{ left: '75%' }}
                            />
                            <div className="absolute -bottom-6 left-0 w-full flex justify-between text-xs pointer-events-none">
                                <span className="text-green-600" role="img" aria-label="success">✅</span>
                                <span className="text-red-600" role="img" aria-label="failure">❌</span>
                            </div>
                        </div>
                    ) : (
                        <Handle 
                            type="source" 
                            position={Position.Bottom} 
                            className="w-3 h-3"
                            id="default"
                        />
                    )}
                </>
            )}
        </div>
    );
}