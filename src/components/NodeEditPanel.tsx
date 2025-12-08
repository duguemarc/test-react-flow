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
        formState: { errors, isValid },
        watch
    } = useForm<NodeFormData>({
        resolver: zodResolver(nodeFormSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            stepType: 'start',
            description: '',
            hasConditionalOutputs: false,
            successRate: 80
        },
        values: selectedNode ? {
            name: selectedNode.data.name,
            stepType: selectedNode.data.stepType,
            description: selectedNode.data.description || '',
            hasConditionalOutputs: selectedNode.data.hasConditionalOutputs || false,
            successRate: selectedNode.data.successRate || 80
        } : undefined
    });

    const stepType = watch('stepType');
    const canHaveConditionalOutputs = stepType && !(['start', 'end'] as StepType[]).includes(stepType);
    const isCustomType = stepType === 'custom';

    const onSubmit = handleSubmit((data: NodeFormData) => {
        if (selectedNode) {
            onNodeUpdate(selectedNode.id, {
                name: data.name,
                stepType: data.stepType,
                description: data.description || '',
                hasConditionalOutputs: data.hasConditionalOutputs || false,
                successRate: data.stepType === 'custom' ? data.successRate : undefined,
                status: selectedNode.data.status // Préserver le statut existant
            });
        }
    });

    if (!selectedNode) {
        return (
            <div className="flex basis-4/5 bg-white p-4">
                <p className="text-gray-500">Sélectionnez un nœud pour l'éditer</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col basis-4/5 bg-white p-4">
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

                {isCustomType && (
                    <div>
                        <label htmlFor="successRate" className="block text-sm font-medium text-gray-700 mb-1">
                            Taux de réussite (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            {...register('successRate', { valueAsNumber: true })}
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Entrez un pourcentage (0-100)"
                        />
                        {errors.successRate && (
                            <p className="text-red-500 text-sm mt-1">{errors.successRate.message}</p>
                        )}
                    </div>
                )}

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
                    disabled={!isValid}
                    className={`w-full text-white py-2 px-4 rounded-md bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Mettre à jour
                </button>
            </form>
        </div>
    );
}