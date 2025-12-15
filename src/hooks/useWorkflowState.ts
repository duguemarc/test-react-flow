
import { useState, useCallback, useMemo } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge, type Node, type Edge, type NodeChange, type EdgeChange, type Connection } from '@xyflow/react';
import type {WorkflowNodeData} from "../types/WorkflowSimulationTypes.ts";
import { hasConditionalOutputsByType } from '../utils/step_utils.ts';

export type WorkflowNodeType = Node<WorkflowNodeData, 'workflow'>;

// Fonction utilitaire pour valider un edge
const isEdgeValid = (edge: Edge, nodes: WorkflowNodeType[]): boolean => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    // Vérifier que les nœuds existent
    if (!sourceNode || !targetNode) {
        return false;
    }

    // Vérifier les handles source selon le type de nœud
    const hasConditionalOutputs = hasConditionalOutputsByType(sourceNode.data.stepType);

    if (hasConditionalOutputs) {
        // Si le nœud a des sorties conditionnelles, l'edge doit utiliser 'success' ou 'failure'
        return ['success', 'failure'].includes(edge.sourceHandle || '');
    } else {
        // Si le nœud n'a pas de sorties conditionnelles, l'edge doit utiliser 'default'
        return edge.sourceHandle === 'default' || edge.sourceHandle === null;
    }
};

// Fonction pour nettoyer les edges invalides
const cleanInvalidEdges = (edges: Edge[], nodes: WorkflowNodeType[]): Edge[] => {
    return edges.filter(edge => isEdgeValid(edge, nodes));
};

export const useWorkflowState = (initialNodes: WorkflowNodeType[] = [], initialEdges: Edge[] = []) => {
    // Nettoyer les edges initiaux au cas où ils seraient incorrects (chargés depuis localStorage)
    const cleanedInitialEdges = useMemo(() => {
        return cleanInvalidEdges(initialEdges, initialNodes);
    }, [initialNodes, initialEdges]);

    const [nodes, setNodes] = useState<WorkflowNodeType[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(cleanedInitialEdges);
    const [selectedNode, setSelectedNode] = useState<WorkflowNodeType | null>(null);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {setNodes((nds) => applyNodeChanges(changes, nds) as WorkflowNodeType[])},
        []
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
        []
    );

    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        setSelectedNode(node as WorkflowNodeType);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);


    const onNodeUpdate = useCallback((nodeId: string, newData: WorkflowNodeData) => {
        const oldNode = nodes.find(n => n.id === nodeId);
        const typeChanged = oldNode && oldNode.data.stepType !== newData.stepType;
        if(typeChanged) console.log("on a changé de type !");
        setNodes((nds) => {
            const updatedNodes = nds.map((node) =>
                node.id === nodeId ? { ...node, data: newData } : node
            );

            if (typeChanged) {
                setEdges((currentEdges) => {
                    console.log("current edges", currentEdges);
                    console.log("updated Nodes", updatedNodes);
                    return cleanInvalidEdges(currentEdges, updatedNodes);
                });
            }

            return updatedNodes;
        });

        // Mettre à jour le nœud sélectionné aussi
        setSelectedNode((selected) =>
            selected?.id === nodeId ? { ...selected, data: newData } : selected
        );
    }, [nodes]);

    const addNode = useCallback((node: WorkflowNodeType) => {
        setNodes((nds) => [...nds, node]);
    }, []);

    const deleteNode = useCallback((nodeId: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
        if (selectedNode?.id === nodeId) {
            setSelectedNode(null);
        }
    }, [selectedNode]);

    // Fonction utilitaire pour forcer un nettoyage des edges
    const cleanEdges = useCallback(() => {
        setEdges((currentEdges) => cleanInvalidEdges(currentEdges, nodes));
    }, [nodes]);

    return {
        nodes,
        edges,
        selectedNode,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodeClick,
        onPaneClick,
        onNodeUpdate,
        addNode,
        deleteNode,
        setSelectedNode,
        setNodes,
        cleanEdges,
    };
};