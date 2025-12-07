import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

export type MyCustomNodeData = {
    name: string;
    stepType: string;
    description: string;
};

export type MyCustomNodeType = Node<MyCustomNodeData, 'custom'>;

export default function MyCustomNode({ data, selected }: NodeProps<MyCustomNodeType>) {
    return (
        <div 
            className={`px-4 py-2 shadow-md rounded-md bg-white border-2 transition-all ${
                selected ? 'border-blue-500 shadow-lg' : 'border-gray-200'
            }`}
        >
            <Handle type="target" position={Position.Left} />
            <div className="font-medium text-gray-900">
                {data.name}
            </div>
            <Handle type="source" position={Position.Right} />
        </div>
    );
}