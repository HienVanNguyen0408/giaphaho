'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ComponentType } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
  type ReactFlowProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getMembers } from '@/lib/api';
import { flatToFlowGraph } from '@/lib/treeUtils';
import type { Member, MemberDetail } from '@/types';
import { getMember } from '@/lib/api';

// Cast ReactFlow to avoid React 19 generic component JSX type issue
const RF = ReactFlow as ComponentType<ReactFlowProps>;

// -------- Types --------
export type MemberNodeData = { member: Member } & Record<string, unknown>;

// -------- Custom Node --------
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
      className={`bg-white border-2 rounded-xl shadow-md px-3 py-2 w-48 text-center cursor-pointer transition-all ${
        selected
          ? 'border-red-600 shadow-red-200 shadow-lg'
          : 'border-stone-200 hover:border-red-400'
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

// -------- Detail Panel --------
function DetailPanel({ memberId, onClose }: { memberId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMember(memberId)
      .then((res) => setDetail(res.data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [memberId]);

  return (
    <div className="absolute top-4 right-4 z-10 w-72 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden">
      <div className="bg-gradient-to-r from-red-700 to-amber-600 px-4 py-3 flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Thông tin thành viên</h3>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors text-lg leading-none"
          aria-label="Đóng"
        >
          ×
        </button>
      </div>

      {loading ? (
        <div className="p-4 space-y-3 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-stone-200 mx-auto" />
          <div className="h-4 bg-stone-200 rounded w-3/4 mx-auto" />
          <div className="h-20 bg-stone-200 rounded" />
        </div>
      ) : detail ? (
        <div className="p-4 space-y-3 overflow-y-auto max-h-96">
          <div className="flex flex-col items-center gap-2">
            {detail.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={detail.avatar}
                alt={detail.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 border-stone-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-700 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                {detail.fullName
                  .split(' ')
                  .slice(-2)
                  .map((w) => w[0])
                  .join('')}
              </div>
            )}
            <h4 className="font-bold text-stone-900 text-center">{detail.fullName}</h4>
            {(detail.birthYear || detail.deathYear) && (
              <p className="text-xs text-stone-500">
                {detail.birthYear ?? '?'} – {detail.deathYear ?? 'nay'}
              </p>
            )}
          </div>
          {detail.parent && (
            <p className="text-xs text-stone-600">
              <span className="font-medium">Cha/Mẹ: </span>
              <a href={`/thanh-vien/${detail.parent.id}`} className="text-red-700 hover:underline">
                {detail.parent.fullName}
              </a>
            </p>
          )}
          {detail.children.length > 0 && (
            <div className="text-xs text-stone-600">
              <p className="font-medium mb-1">Con cái:</p>
              <ul className="space-y-0.5 pl-2">
                {detail.children.map((c) => (
                  <li key={c.id}>
                    <a href={`/thanh-vien/${c.id}`} className="text-red-700 hover:underline">
                      {c.fullName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {detail.bio && (
            <p className="text-xs text-stone-600 leading-relaxed">{detail.bio}</p>
          )}
          <a
            href={`/thanh-vien/${detail.id}`}
            className="block text-center text-xs font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg py-1.5 transition-colors"
          >
            Xem trang đầy đủ →
          </a>
        </div>
      ) : (
        <p className="p-4 text-xs text-stone-500 text-center">Không tìm thấy thông tin.</p>
      )}
    </div>
  );
}

// -------- Loading Skeleton --------
function TreeSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-stone-50">
      <div className="text-center space-y-4">
        <div className="flex gap-6 justify-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-48 h-20 rounded-xl bg-stone-200 animate-pulse" />
          ))}
        </div>
        <p className="text-stone-400 text-sm">Đang tải gia phả...</p>
      </div>
    </div>
  );
}

// -------- Inner Flow --------
function FamilyTreeInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    getMembers()
      .then((res) => {
        const { nodes: n, edges: e } = flatToFlowGraph(res.data);
        setNodes(n as unknown as Node[]);
        setEdges(e);
      })
      .catch(() => {
        setNodes([]);
        setEdges([]);
      })
      .finally(() => setLoading(false));
  }, [setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedId(node.id);
  }, []);

  const onPaneClick = useCallback(() => setSelectedId(null), []);

  if (loading) return <TreeSkeleton />;

  return (
    <div className="relative w-full h-full">
      <RF
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        className="bg-stone-50"
      >
        <Background color="#d6d3d1" gap={24} size={1} />
        <Controls />
        <MiniMap maskColor="rgba(250, 250, 249, 0.8)" />
      </RF>
      {selectedId && (
        <DetailPanel memberId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

// -------- Export --------
export default function FamilyTree() {
  return (
    <ReactFlowProvider>
      <FamilyTreeInner />
    </ReactFlowProvider>
  );
}
