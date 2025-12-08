import type { SimulationLogEntry } from '../types/WorkflowSimulationTypes';
import { getStatusLabel } from '../utils/step_utils.ts';

interface SimulationLogProps {
    log: SimulationLogEntry[];
    onClear: () => void;
}

export default function SimulationLog({ log, onClear }: SimulationLogProps) {
    if (log.length === 0) {
        return (
            <div className="bg-gray-50 border rounded p-4 flex items-center justify-center text-gray-500">
                Aucune simulation lancée
            </div>
        );
    }

    return (
        <div className="bg-white border rounded overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-3 border-b bg-gray-50">
                <h3 className="font-semibold text-sm">Journal d'exécution</h3>
                <button
                    onClick={onClear}
                    className="text-xs text-red-600 hover:text-red-800"
                >
                    Vider
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {log.map((entry, index) => (
                    <div key={`${entry.nodeId}-${index}`} className="text-xs border-l-2 border-gray-200 pl-2 py-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="font-medium">{entry.nodeName}</span>
                                <span className="ml-2 text-gray-600">
                                    {getStatusLabel(entry.status)}
                                </span>
                            </div>
                            <div className="text-gray-400 text-right">
                                <div>{entry.timestamp.toLocaleTimeString()}</div>
                                {entry.duration && (
                                    <div>{entry.duration}ms</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
