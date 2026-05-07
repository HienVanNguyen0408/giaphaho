'use client';

import { useMemo } from 'react';
import type { ComponentType } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Handle,
  Position,
  type NodeProps,
  type ReactFlowProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { flatToFlowGraph, getLineageMembers } from '@/lib/treeUtils';
import type { Member } from '@/types';

type MemberNodeData = { member: Member } & Record<string, unknown>;

const RF = ReactFlow as ComponentType<ReactFlowProps>;

function MemberNode({ data, selected }: NodeProps) {
  const member = (data as MemberNodeData).member;
  const initials = member.fullName
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('');
  const years =
    member.birthYear || member.deathYear
      ? `${member.birthYear ?? '?'} – ${member.deathYear ?? 'nay'}`
      : null;

  return (
    <div
      className={`bg-white border-2 rounded-xl shadow-md px-3 py-2 w-48 text-center transition-all ${
        selected ? 'border-red-600 shadow-red-200 shadow-lg' : 'border-stone-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-red-400 !w-2 !h-2" />
      <div className="flex flex-col items-center gap-1">
        {member.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatar}
            alt={member.fullName}
            className="w-12 h-12 rounded-full object-cover border-2 border-stone-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-700 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
        )}
        <p className="text-xs font-semibold text-stone-800 leading-tight line-clamp-2">
          {member.fullName}
        </p>
        {years && <p className="text-xs text-stone-400">{years}</p>}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-red-400 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { memberNode: MemberNode };

function LineageTreeInner({ lineageMembers }: { lineageMembers: Member[] }) {
  const { nodes, edges } = useMemo(() => {
    return flatToFlowGraph(lineageMembers);
  }, [lineageMembers]);

  return (
    <RF
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      minZoom={0.05}
      maxZoom={3}
      className="bg-stone-50"
    >
      <Background color="#d6d3d1" gap={24} size={1} />
      <Controls />
      <MiniMap
        maskColor="rgba(250, 250, 249, 0.8)"
        nodeColor="#e5e5e5"
        nodeStrokeColor="#8b1a1a"
        pannable
        zoomable
      />
    </RF>
  );
}

interface LineageModalProps {
  memberId: string;
  memberName: string;
  allMembers: Member[];
  onClose: () => void;
}

export default function LineageModal({ memberId, memberName, allMembers, onClose }: LineageModalProps) {
  const lineageMembers = useMemo(() => getLineageMembers(memberId, allMembers), [memberId, allMembers]);

  const generations = useMemo(() => {
    const gens = lineageMembers.map((m) => m.generation).filter((g): g is number => g != null);
    if (gens.length === 0) return null;
    return Math.max(...gens) - Math.min(...gens) + 1;
  }, [lineageMembers]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-red-700 to-amber-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-white font-semibold text-base">Cây trực hệ — {memberName}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-white/80 text-xs">{lineageMembers.length} thành viên</span>
              {generations != null && (
                <>
                  <span className="text-white/40 text-xs">·</span>
                  <span className="text-white/80 text-xs">{generations} đời</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl leading-none"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <LineageTreeInner lineageMembers={lineageMembers} />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}
