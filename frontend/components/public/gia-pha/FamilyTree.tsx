'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { ComponentType } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
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

// -------- Tree Search Component --------
function TreeSearch({ nodes, onSelect }: { nodes: Node[], onSelect: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { setCenter, fitView } = useReactFlow();

  const filtered = query
    ? nodes.filter(n => {
        const member = (n.data as MemberNodeData).member;
        return member.fullName.toLowerCase().includes(query.toLowerCase());
      }).slice(0, 10)
    : [];

  const handleSelect = (node: Node) => {
    setQuery('');
    setShowResults(false);
    onSelect(node.id);
    
    // Zoom and center on node
    setCenter(node.position.x + 100, node.position.y + 60, { zoom: 1.5, duration: 800 });
  };

  return (
    <div className="absolute top-4 left-16 z-10">
      <div className="relative w-64 sm:w-80">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Tìm nhanh thành viên..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white/90 backdrop-blur text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-red-400 shadow-md"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {showResults && query && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-stone-200 max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-xs text-stone-500 text-center">Không tìm thấy ai</div>
            ) : (
              <ul className="py-1">
                {filtered.map(n => {
                  const m = (n.data as MemberNodeData).member;
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => handleSelect(n)}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-stone-800 flex flex-col transition-colors"
                      >
                        <span className="font-semibold">{m.fullName}</span>
                        <span className="text-[10px] text-stone-500">
                          {m.birthYear ? `SN: ${m.birthYear}` : ''} {m.chiId ? `| Chi: ${m.chiId.slice(0,6)}` : ''}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
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
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="relative w-full h-full bg-stone-50">
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
        minZoom={0.005}
        maxZoom={3}
        className="bg-stone-50"
      >
        <Background color="#d6d3d1" gap={24} size={1} />
        <Controls />
        <MiniMap 
          maskColor="rgba(250, 250, 249, 0.8)" 
          pannable 
          zoomable 
          nodeColor="#e5e5e5" 
          nodeStrokeColor="#8b1a1a" 
        />
        
        {/* Search Bar */}
        <TreeSearch nodes={nodes} onSelect={setSelectedId} />

        {/* Fullscreen Button */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                containerRef.current?.requestFullscreen().catch(err => {
                  console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
              } else {
                document.exitFullscreen();
              }
            }}
            className="bg-white w-10 h-10 rounded-xl shadow-md border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-red-400 transition-colors flex items-center justify-center group"
            title="Xem toàn màn hình"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
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
