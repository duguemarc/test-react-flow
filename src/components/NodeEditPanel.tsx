import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { WorkflowNodeType } from "../hooks/useWorkflowState";
import type { WorkflowNodeData, StepType } from "../types/WorkflowSimulationTypes";
import { type NodeFormData, nodeFormSchema } from "../validation/NodeFormSchema";

interface NodeEditPanelProps {
    selectedNode: WorkflowNodeType | null;
    onNodeUpdate: (nodeId: string, data: WorkflowNodeData) => void;
}

export default function NodeEditPanel({ selectedNode, onNodeUpdate }: NodeEditPanelProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm<NodeFormData>({
        resolver: zodResolver(nodeFormSchema),
        defaultValues: {
            name: '',
            stepType: 'start',
            description: '',
            hasConditionalOutputs: false
        },
        values: selectedNode ? {
            name: selectedNode.data.name,
            stepType: selectedNode.data.stepType,
            description: selectedNode.data.description || '',
            hasConditionalOutputs: selectedNode.data.hasConditionalOutputs || false
        } : undefined
    });

    const stepType = watch('stepType');
    const canHaveConditionalOutputs = stepType && !(['start', 'end'] as StepType[]).includes(stepType);

    const onSubmit = handleSubmit((data: NodeFormData) => {
        if (selectedNode) {
            onNodeUpdate(selectedNode.id, {
                name: data.name,
                stepType: data.stepType,
                description: data.description || '',
                hasConditionalOutputs: data.hasConditionalOutputs || false,
                status: selectedNode.data.status // Préserver le statut existant
            });
        }
    });

    if (!selectedNode) {
        return (
            <div className="flex h-screen basis-1/4 bg-white p-4">
                <p className="text-gray-500">Sélectionnez un nœud pour l'éditer</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen basis-1/4 bg-white p-4">
            <h2 className="text-xl font-bold mb-4">Édition du nœud</h2>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register('name')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="stepType" className="block text-sm font-medium text-gray-700 mb-1">
                        Type d'étape
                    </label>
                    <select
                        id="stepType"
                        {...register('stepType')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="start">Start</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="custom">Custom</option>
                        <option value="end">End</option>
                    </select>
                    {errors.stepType && (
                        <p className="text-red-500 text-sm mt-1">{errors.stepType.message}</p>
                    )}
                </div>

                {canHaveConditionalOutputs && (
                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                {...register('hasConditionalOutputs')}
                                className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Transitions conditionnelles (Success/Failure)
                            </span>
                        </label>
                    </div>
                )}

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows={3}
                        {...register('description')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                    Mettre à jour
                </button>
            </form>
        </div>
    );
}