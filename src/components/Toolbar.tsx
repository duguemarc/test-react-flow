import type { StepType } from '../types/WorkflowSimulationTypes';
import { getStepIcon } from '../step_utils';

interface ToolbarProps {
    onAddNode: (stepType: StepType) => void;
    onDeleteSelected: () => void;
    onStartSimulation: () => void;
    hasSelectedNode: boolean;
    isSimulating: boolean;
}

export default function Toolbar({ 
    onAddNode, 
    onDeleteSelected, 
    onStartSimulation,
    hasSelectedNode,
    isSimulating
}: ToolbarProps) {
    const nodeTypes: { type: StepType; label: string }[] = [
        { type: 'start', label: 'Start' },
        { type: 'email', label: 'Email' },
        { type: 'sms', label: 'SMS' },
        { type: 'custom', label: 'Custom' },
        { type: 'end', label: 'End' },
    ];

    return (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 flex gap-3 items-center">
            {/* Boutons d'ajout de nœuds */}
            <div className="flex gap-1">
                {nodeTypes.map((nodeType) => (
                    <button
                        key={nodeType.type}
                        onClick={() => onAddNode(nodeType.type)}
                        disabled={isSimulating}
                        className="flex flex-col items-center p-2 text-xs bg-gray-50 hover:bg-gray-100 border rounded transition-colors min-w-16 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={`Ajouter ${nodeType.label}`}
                    >
                        <span className="text-lg mb-1">{getStepIcon(nodeType.type)}</span>
                        <span>{nodeType.label}</span>
                    </button>
                ))}
            </div>
            
            <div className="border-l h-8"></div>
            
            {/* Bouton de suppression */}
            <button
                onClick={onDeleteSelected}
                disabled={!hasSelectedNode || isSimulating}
                className="flex flex-col items-center p-2 text-xs bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors min-w-16 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Supprimer le nœud sélectionné"
            >
                <span className="text-lg mb-1">🗑️</span>
                <span>Supprimer</span>
            </button>

            <div className="border-l h-8"></div>

            {/* Bouton de simulation */}
            <button
                onClick={onStartSimulation}
                disabled={isSimulating}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Lancer la simulation"
            >
                <span className="text-lg">▶️</span>
                <span>{isSimulating ? 'Simulation en cours...' : 'Simuler'}</span>
            </button>
        </div>
    );
}