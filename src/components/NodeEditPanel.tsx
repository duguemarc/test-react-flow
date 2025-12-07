import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type {MyCustomNodeData, MyCustomNodeType} from './MyCustomNode';

const nodeSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    stepType: z.string().min(1, 'Le type d\'étape est requis'),
    description: z.string().optional()
});

type NodeFormData = z.infer<typeof nodeSchema>;

interface NodeEditPanelProps {
    selectedNode: MyCustomNodeType | null;
    onNodeUpdate: (nodeId: string, data: MyCustomNodeData) => void;
}

export default function NodeEditPanel({ selectedNode, onNodeUpdate }: NodeEditPanelProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<NodeFormData>({
        resolver: zodResolver(nodeSchema),
        values: selectedNode ? {
            name: selectedNode.data.name || '',
            stepType: selectedNode.data.stepType || '',
            description: selectedNode.data.description || ''
        } : {
            name: '',
            stepType: '',
            description: ''
        }
    });

    const onSubmit = (data: NodeFormData) => {
        if (selectedNode) {
            onNodeUpdate(selectedNode.id, {
                name: data.name,
                stepType: data.stepType,
                description: data.description || ''
            });
        }
    };

    if (!selectedNode) {
        return (
            <div className="flex h-screen basis-1/4 bg-white p-4">
                <p className="text-gray-500">Sélectionnez une node pour l'éditer</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen basis-1/4 bg-white p-4">
            <h2 className="text-xl font-bold mb-4">Édition de la node</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        <option value="">Sélectionnez un type</option>
                        <option value="start">Start</option>
                        <option value="mail">Mail</option>
                        <option value="sms">SMS</option>
                        <option value="custom">Custom</option>
                        <option value="end">End</option>
                    </select>
                    {errors.stepType && (
                        <p className="text-red-500 text-sm mt-1">{errors.stepType.message}</p>
                    )}
                </div>

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
