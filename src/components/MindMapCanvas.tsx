import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  Node,
  Handle,
  Position,
  ConnectionLineType
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MindMapNodeData {
  label: string;
  description?: string;
  isRoot?: boolean;
}

const CustomNode = ({ id, data }: { id: string; data: MindMapNodeData }) => {
  // Choose color based on position/type
  const getBgColor = () => {
    if (data.isRoot) return 'bg-[#FFD54F]'; // node-main
    
    const colors = [
      'bg-[#BBDEFB]', // blue
      'bg-[#C8E6C9]', // green
      'bg-[#F8BBD0]', // pink
      'bg-[#FFE0B2]', // orange
    ];
    // Simple hash-like index based on ID or index
    const index = parseInt(id.replace(/\D/g, '') || '0') % colors.length;
    return colors[index];
  };

  return (
    <div className={`px-6 py-4 min-w-[180px] text-center flex flex-col items-center justify-center min-h-[70px] ${getBgColor()}`}>
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <div className="font-bold text-sm leading-tight text-[#2D2D2D]">{data.label}</div>
      {data.description && (
        <div className="text-[10px] text-[#2D2D2D]/60 mt-1 line-clamp-2 leading-tight font-medium uppercase tracking-tight">
          {data.description}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

interface Props {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: (node: Node) => void;
}

export const MindMapCanvas: React.FC<Props> = ({ nodes, edges, onNodeClick }) => {
  return (
    <div className="w-full h-full bg-[#F7F5F2] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onNodeClick(node)}
        fitView
        connectionLineType={ConnectionLineType.SmoothStep}
        className="bg-[#F7F5F2]"
      >
        <Background 
          gap={24} 
          color="#D1D1D1" 
          variant="dots"
          style={{ backgroundImage: 'radial-gradient(#D1D1D1 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <Controls />
      </ReactFlow>
    </div>
  );
};
