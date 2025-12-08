import { useState, useCallback } from 'react';
import { ReactFlow, type NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodeEditPanel from './components/NodeEditPanel';
import Toolbar from './components/Toolbar';
import { useWorkflowState, type WorkflowNodeType } from './hooks/useWorkflowState';
import WorkflowNode from "./components/WorkflowNode.tsx";
import type { StepType } from './types/WorkflowSimulationTypes';

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
        addNode,
        deleteNode,
    } = useWorkflowState(initialNodes, initialEdges);

    const [nodeIdCounter, setNodeIdCounter] = useState(2);
    const [isSimulating, setIsSimulating] = useState(false);

    const getDefaultName = (type: StepType): string => {
        const nameMap: Record<StepType, string> = {
            start: 'Début',
            email: 'Email',
            sms: 'SMS',
            custom: 'Étape personnalisée',
            end: 'Fin',
        };
        return nameMap[type];
    };

    const onAddNode = useCallback((stepType: StepType) => {
        const newNodeId = `${stepType}-${nodeIdCounter}`;
        
        const newNode: WorkflowNodeType = {
            id: newNodeId,
            position: { 
                x: Math.random() * 400 + 100, 
                y: Math.random() * 300 + 100 
            },
            data: {
                name: getDefaultName(stepType),
                stepType,
                description: '',
                hasConditionalOutputs: stepType !== 'start' && stepType !== 'end' ? false : undefined
            },
            type: 'workflow'
        };

        addNode(newNode);
        setNodeIdCounter(prev => prev + 1);
    }, [nodeIdCounter, addNode]);

    const onDeleteSelected = useCallback(() => {
        if (selectedNode) {
            deleteNode(selectedNode.id);
        }
    }, [selectedNode, deleteNode]);

    const onStartSimulation = useCallback(() => {
        setIsSimulating(true);
        console.log('Simulation démarrée!');
        
        // Simulation temporaire
        setTimeout(() => {
            setIsSimulating(false);
            console.log('Simulation terminée!');
        }, 3000);
    }, []);

    return (
        <div className="h-screen w-screen flex bg-gray-200">
            <div className="flex-1 relative">
                <ReactFlow 
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onNodeDrag={onNodeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    nodesDraggable
                    nodesConnectable
                    elementsSelectable
                    fitView
                    fitViewOptions={{ maxZoom:1 }}
                />
                <Toolbar 
                    onAddNode={onAddNode}
                    onDeleteSelected={onDeleteSelected}
                    onStartSimulation={onStartSimulation}
                    hasSelectedNode={selectedNode !== null}
                    isSimulating={isSimulating}
                />
            </div>
            <NodeEditPanel 
                selectedNode={selectedNode}
                onNodeUpdate={onNodeUpdate}
            />
        </div>
    );
}