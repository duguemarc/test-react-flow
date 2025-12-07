import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, type NodeTypes, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MyCustomNode, { type MyCustomNodeType, type MyCustomNodeData } from './components/MyCustomNode';
import NodeEditPanel from './components/NodeEditPanel';

const initialNodes: MyCustomNodeType[] = [
    { 
        id: 'n1', 
        position: { x: 0, y: 0 }, 
        data: { name: 'Node 1', stepType: 'start', description: 'Start' },
        type: 'custom'
    },
    { 
        id: 'n2', 
        position: { x: 0, y: 100 }, 
        data: { name: 'Node 2', stepType: 'SMS', description: 'Deuxième nœud' },
        type: 'custom'
    },
];

const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

const nodeTypes: NodeTypes = {
    custom: MyCustomNode,
};

export default function App() {
    const [nodes, setNodes] = useState<MyCustomNodeType[]>(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [selectedNode, setSelectedNode] = useState<MyCustomNodeType | null>(null);

    const onNodesChange = useCallback(
        (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    
    const onEdgesChange = useCallback(
        (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );
    
    const onConnect = useCallback(
        (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );

    const onNodeClick = useCallback((_event, node: Node) => {
        setSelectedNode(node as MyCustomNodeType);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const onNodeUpdate = useCallback((nodeId: string, newData: MyCustomNodeData) => {
        setNodes((nodesSnapshot) =>
            nodesSnapshot.map((node) =>
                node.id === nodeId ? { ...node, data: newData } : node
            )
        );
    }, []);

    return (
        <div className="h-screen w-screen flex flex-row">
            <ReactFlow 
                className="basis-3/4"
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                fitView
            />
            <NodeEditPanel 
                selectedNode={selectedNode}
                onNodeUpdate={onNodeUpdate}
            />
        </div>
    );
}