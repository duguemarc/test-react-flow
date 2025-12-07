import { ReactFlow, type NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodeEditPanel from './components/NodeEditPanel';
import {useWorkflowState, type WorkflowNodeType} from './hooks/useWorkflowState';
import WorkflowNode from "./components/WorkflowNode.tsx";

const initialNodes: WorkflowNodeType[] = [
    { 
        id: 'start-1', 
        position: { x: 250, y: 0 }, 
        data: { name: 'Début', stepType: 'start', description: 'Point de départ du workflow' },
        type: 'workflow'
    },
    { 
        id: 'email-1', 
        position: { x: 250, y: 150 }, 
        data: { name: 'Email de bienvenue', stepType: 'email', description: 'Envoi d\'un email de bienvenue', hasConditionalOutputs: true },
        type: 'workflow'
    },
];

const initialEdges = [
    { id: 'start-1-email-1', source: 'start-1', target: 'email-1', sourceHandle: 'default', targetHandle: 'input' }
];

const nodeTypes: NodeTypes = {
    workflow: WorkflowNode,
};

export default function App() {
    const {
        nodes,
        edges,
        selectedNode,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodeClick,
        onPaneClick,
        onNodeUpdate,
    } = useWorkflowState(initialNodes, initialEdges);

    return (
        <div className="h-screen w-screen flex bg-gray-50">
            <div className="flex-1">
                <ReactFlow 
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-gray-100"
                    nodesDraggable
                    nodesConnectable
                    elementsSelectable
                />
            </div>
            <NodeEditPanel 
                selectedNode={selectedNode}
                onNodeUpdate={onNodeUpdate}
            />
        </div>
    );
}