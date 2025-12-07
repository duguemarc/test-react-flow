import { useState, useCallback } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge, type Node, type Edge, type NodeChange, type EdgeChange, type Connection } from '@xyflow/react';
import type {WorkflowNodeData} from "../types/WorkflowSimulationTypes.ts";

export type WorkflowNodeType = Node<WorkflowNodeData, 'workflow'>;

export const useWorkflowState = (initialNodes: WorkflowNodeType[] = [], initialEdges: Edge[] = []) => {
    const [nodes, setNodes] = useState<WorkflowNodeType[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [selectedNode, setSelectedNode] = useState<WorkflowNodeType | null>(null);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds) as WorkflowNodeType[]),
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
        setNodes((nds) =>
            nds.map((node) =>
                node.id === nodeId ? { ...node, data: newData } : node
            )
        );
        // Mettre à jour le nœud sélectionné aussi
        setSelectedNode((selected) =>
            selected?.id === nodeId ? { ...selected, data: newData } : selected
        );
    }, []);

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
    };
};
