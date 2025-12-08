import { useState, useCallback, useRef } from 'react';
import type { WorkflowNodeType } from './useWorkflowState';
import type { SimulationLogEntry, ExecutionStatus } from '../types/WorkflowSimulationTypes';
import type { Edge } from '@xyflow/react';

export const useWorkflowSimulation = () => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationLog, setSimulationLog] = useState<SimulationLogEntry[]>([]);
    const simulationRef = useRef<boolean>(false);

    // Fonction pour valider le workflow
    const validateWorkflow = useCallback((nodes: WorkflowNodeType[]): { isValid: boolean; error?: string } => {
        const startNodes = nodes.filter(node => node.data.stepType === 'start');
        const endNodes = nodes.filter(node => node.data.stepType === 'end');

        if (startNodes.length === 0) {
            return { isValid: false, error: 'Le workflow doit contenir exactement un nœud de départ' };
        }

        if (startNodes.length > 1) {
            return { isValid: false, error: 'Le workflow ne peut contenir qu\'un seul nœud de départ' };
        }

        if (endNodes.length === 0) {
            return { isValid: false, error: 'Le workflow doit contenir au moins un nœud de fin' };
        }

        return { isValid: true };
    }, []);

    // Fonction pour simuler l'exécution d'une étape
    const simulateStepExecution = useCallback(async (node: WorkflowNodeType): Promise<ExecutionStatus> => {
        // Délai de simulation
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        switch (node.data.stepType) {
            case 'start':
                return 'success'; // Start réussit toujours
            case 'sms':
                return 'success'; // SMS réussit toujours
            case 'email':
                return Math.random() < 0.7 ? 'success' : 'failure'; // 70% de chance de succès
            case 'custom':
                {
                    const successRate = (node.data.successRate ?? 80) / 100;
                    return Math.random() < successRate ? 'success' : 'failure';
                }
            case 'end':
                return 'success'; // End réussit toujours
            default:
                return 'failure';
        }
    }, []);

    // Fonction pour trouver les nœuds suivants selon le résultat
    const getNextNodes = useCallback((
        currentNodeId: string, 
        result: ExecutionStatus, 
        nodes: WorkflowNodeType[], 
        edges: Edge[]
    ): WorkflowNodeType[] => {
        const currentNode = nodes.find(n => n.id === currentNodeId);
        if (!currentNode) {
            console.log('Nœud courant non trouvé:', currentNodeId);
            return [];
        }

        let relevantEdges;
        
        if (currentNode.data.hasConditionalOutputs) {
            // Pour les noeuds avec transitions conditionnelles
            const handleId = result === 'success' ? 'success' : 'failure';
            relevantEdges = edges.filter(edge => 
                edge.source === currentNodeId && edge.sourceHandle === handleId
            );
            console.log(`Nœud ${currentNodeId} avec transitions conditionnelles, résultat: ${result}, handle: ${handleId}, edges trouvés:`, relevantEdges);
        } else {
            // Pour les noeuds avec sortie unique
            relevantEdges = edges.filter(edge => 
                edge.source === currentNodeId
            );
            console.log(`Nœud ${currentNodeId} avec sortie unique, edges trouvés:`, relevantEdges);
        }

        return relevantEdges.map(edge => 
            nodes.find(node => node.id === edge.target)
        ).filter(Boolean) as WorkflowNodeType[];
    }, []);

    const startSimulation = useCallback(async (
        nodes: WorkflowNodeType[], 
        edges: Edge[],
        onNodeStatusUpdate: (nodeId: string, status: ExecutionStatus) => void
    ) => {
        console.log('Démarrage de la simulation avec:', { nodes: nodes.length, edges: edges.length });
        
        // Valider le workflow
        const validation = validateWorkflow(nodes);
        if (!validation.isValid) {
            alert(`Impossible de lancer la simulation: ${validation.error}`);
            return;
        }
        
        setIsSimulating(true);
        simulationRef.current = true;
        setSimulationLog([]);

        try {
            // Réinitialiser tous les statuts
            nodes.forEach(node => {
                onNodeStatusUpdate(node.id, 'pending');
            });

            // Trouver le noeud de départ
            const startNode = nodes.find(node => node.data.stepType === 'start')!;

            console.log('Noeud de départ trouvé:', startNode);

            // File d'exécution
            const executionQueue: WorkflowNodeType[] = [startNode];
            const completedNodes = new Set<string>();

            while (executionQueue.length > 0 && simulationRef.current) {
                console.log('Queue d\'exécution:', executionQueue.map(n => n.id));
                
                // Traiter le premier noeud de la queue
                const currentNode = executionQueue.shift()!;
                
                if (completedNodes.has(currentNode.id)) {
                    continue;
                }

                console.log('Exécution du noeud:', currentNode.id);

                // Marquer comme en cours
                onNodeStatusUpdate(currentNode.id, 'running');
                
                const startTime = new Date();
                setSimulationLog(prev => [...prev, {
                    nodeId: currentNode.id,
                    nodeName: currentNode.data.name,
                    status: 'running',
                    timestamp: startTime
                }]);

                // Exécuter l'étape
                const result = await simulateStepExecution(currentNode);
                const endTime = new Date();
                const duration = endTime.getTime() - startTime.getTime();

                if (!simulationRef.current) break;

                console.log(`Nœud ${currentNode.id} terminé avec le résultat: ${result}`);

                // Mettre à jour le statut
                onNodeStatusUpdate(currentNode.id, result);
                completedNodes.add(currentNode.id);

                // Ajouter au log
                setSimulationLog(prev => [...prev, {
                    nodeId: currentNode.id,
                    nodeName: currentNode.data.name,
                    status: result,
                    timestamp: endTime,
                    duration
                }]);

                // Ajouter les nœuds suivants à la file d'exécution
                const nextNodes = getNextNodes(currentNode.id, result, nodes, edges);
                console.log('Nœuds suivants à ajouter:', nextNodes.map(n => n.id));
                
                nextNodes.forEach(nextNode => {
                    // Vérifier que tous les prérequis sont satisfaits
                    const incomingEdges = edges.filter(edge => edge.target === nextNode.id);
                    const allPrerequisitesMet = incomingEdges.every(edge => {
                        return completedNodes.has(edge.source);
                    });

                    console.log(`Nœud ${nextNode.id}: prérequis satisfaits = ${allPrerequisitesMet}`);

                    if (allPrerequisitesMet && !completedNodes.has(nextNode.id) && 
                        !executionQueue.find(n => n.id === nextNode.id)) {
                        executionQueue.push(nextNode);
                        console.log(`Nœud ${nextNode.id} ajouté à la queue`);
                    }
                });

                // Attendre un peu avant de passer au suivant
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            console.log('Simulation terminée');
        } catch (error) {
            console.error('Erreur durante la simulation:', error);
        } finally {
            setIsSimulating(false);
            simulationRef.current = false;
        }
    }, [validateWorkflow, simulateStepExecution, getNextNodes]);

    const stopSimulation = useCallback(() => {
        console.log('Arrêt de la simulation');
        setIsSimulating(false);
        simulationRef.current = false;
    }, []);

    const clearLog = useCallback((nodes: WorkflowNodeType[], onNodeStatusUpdate: (nodeId: string, status: ExecutionStatus) => void) => {
        nodes.forEach(node => {
            onNodeStatusUpdate(node.id, 'pending');
        });

        setSimulationLog([]);
    }, []);

    return {
        isSimulating,
        simulationLog,
        startSimulation,
        stopSimulation,
        clearLog,
        validateWorkflow
    };
};