import { useState, useCallback } from 'react';
import { ReactFlow, type NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodeEditPanel from './components/NodeEditPanel';
import Toolbar from './components/Toolbar';
import SimulationLog from './components/SimulationLog';
import { useWorkflowState, type WorkflowNodeType } from './hooks/useWorkflowState';
import { useWorkflowSimulation } from './hooks/useWorkflowSimulation';
import WorkflowNode from "./components/WorkflowNode.tsx";
import type { StepType, ExecutionStatus } from './types/WorkflowSimulationTypes';

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
        setNodes,
    } = useWorkflowState(initialNodes, initialEdges);

    const {
        isSimulating,
        simulationLog,
        startSimulation,
        stopSimulation,
        clearLog
    } = useWorkflowSimulation();

    const [nodeIdCounter, setNodeIdCounter] = useState(2);

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
        if (isSimulating) return;

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
    }, [nodeIdCounter, addNode, isSimulating]);

    const onDeleteSelected = useCallback(() => {
        if (selectedNode && !isSimulating) {
            deleteNode(selectedNode.id);
        }
    }, [selectedNode, deleteNode, isSimulating]);

    const onNodeStatusUpdate = useCallback((nodeId: string, status: ExecutionStatus) => {
        setNodes(prevNodes =>
            prevNodes.map(node =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, status } }
                    : node
            )
        );
    }, [setNodes]);

    const onStartSimulation = useCallback(() => {
        if (isSimulating) {
            stopSimulation();
        } else {
            startSimulation(nodes, edges, onNodeStatusUpdate);
        }
    }, [nodes, edges, isSimulating, startSimulation, stopSimulation, onNodeStatusUpdate]);

    const handleNodeClick = (_event: React.MouseEvent, node: WorkflowNodeType) => {
        onNodeClick(_event,node);
        if (isSimulating) {
            stopSimulation();
        }
        clearLog(nodes, onNodeStatusUpdate);

    }
    return (
        <div className="h-screen w-screen flex bg-gray-200">
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                    onNodeDrag={handleNodeClick}
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
            <div className="w-80 bg-white flex flex-col overflow-scroll">
                {
                    !isSimulating &&
                <div className="flex-1">
                    <NodeEditPanel
                        selectedNode={selectedNode}
                        onNodeUpdate={onNodeUpdate}
                    />
                </div>
                }
                <div className={`border-t p-4 bg-gray-400 basis-auto justify-center flex ${!isSimulating ? 'overflow-scroll' :''}`}>
                    <SimulationLog
                        log={simulationLog}
                        onClear={() => clearLog(nodes, onNodeStatusUpdate)}
                    />
                </div>
            </div>
        </div>
    );
}