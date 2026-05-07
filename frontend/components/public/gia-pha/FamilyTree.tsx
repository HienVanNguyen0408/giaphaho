'use client';

import { useEffect, useState, useCallback, useRef, useMemo, createContext, useContext, Suspense } from 'react';
import type { ComponentType } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { flatToFlowGraph } from '@/lib/treeUtils';
import type { MemberNodeData } from '@/lib/treeUtils';
import { getCachedAllMembers } from '@/lib/memberCache';
import type { Member, MemberDetail } from '@/types';
import { getMember } from '@/lib/api';
import LineageModal from './LineageModal';

const ActiveMemberCtx = createContext<string | null>(null);

// Cast ReactFlow to avoid React 19 generic component JSX type issue
const RF = ReactFlow as ComponentType<ReactFlowProps>;

// -------- Custom Node --------
function MemberNode({ data, selected }: NodeProps) {
  const activeMemberId = useContext(ActiveMemberCtx);
  const { member, descendantsAchievementsCount } = data as MemberNodeData;
  const isActive = activeMemberId === member.id;
  const initials = member.fullName
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('');
  const years =
    member.birthYear || member.deathYear
      ? `${member.birthYear ?? '?'} – ${member.deathYear ?? 'nay'}`
      : null;
  const isDeceased = !!(member.deathYear || member.deathDate);
  const ownAchievements = member.achievements?.length ?? 0;
  const descendantsCount = member.descendantsCount ?? 0;

  return (
    <div
      className={`relative bg-white border-2 rounded-xl shadow-md px-3 py-2 w-48 cursor-pointer transition-all ${
        isActive
          ? 'border-amber-500 shadow-lg'
          : selected
          ? 'border-red-600 shadow-red-200 shadow-lg'
          : 'border-stone-200 hover:border-red-400'
      }`}
      style={
        isActive
          ? { boxShadow: '0 0 0 3px rgba(245,158,11,0.35), 0 6px 24px rgba(245,158,11,0.25)' }
          : undefined
      }
    >
      {/* Active beacon */}
      {isActive && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm leading-tight">
          Đang xem
        </span>
      )}

      <Handle type="target" position={Position.Top} className="!bg-red-400 !w-2 !h-2" />
      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          {member.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.avatar}
              alt={member.fullName}
              className={`w-11 h-11 rounded-full object-cover border-2 ${isActive ? 'border-amber-400' : 'border-stone-200'}`}
            />
          ) : (
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                  : 'linear-gradient(135deg, #991b1b, #d97706)',
              }}
            >
              {initials}
            </div>
          )}
          {isDeceased && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-stone-400 border border-white flex items-center justify-center">
              <span className="text-white text-[6px] leading-none font-bold">✝</span>
            </div>
          )}
        </div>
        <p className={`text-xs font-semibold leading-tight line-clamp-2 text-center ${isActive ? 'text-amber-800' : 'text-stone-800'}`}>
          {member.fullName}
        </p>
        {years && <p className="text-[10px] text-stone-400 leading-none">{years}</p>}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-stone-100">
        {/* Left: descendants count */}
        <div className="flex items-center gap-0.5 text-[9px] text-stone-500">
          <svg className="w-2.5 h-2.5 text-stone-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
          </svg>
          <span className="font-semibold text-stone-700">{descendantsCount}</span>
        </div>
        {/* Right: own achievements | descendants achievements */}
        <div className="flex items-center gap-1 text-[9px]">
          <span className="font-semibold text-amber-700">{ownAchievements}</span>
          <svg className="w-2.5 h-2.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span className="text-stone-300">·</span>
          <span className="font-semibold text-stone-500">{descendantsAchievementsCount}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-red-400 !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { memberNode: MemberNode };

// -------- Detail Panel --------
function DetailPanel({
  memberId,
  onClose,
  onViewLineage,
}: {
  memberId: string;
  onClose: () => void;
  onViewLineage: (id: string, name: string) => void;
}) {
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
          </div>

          {/* Stats: đời thứ & số con cháu */}
          {(detail.generation != null || detail.descendantsCount != null) && (
            <div className="flex gap-2">
              {detail.generation != null && (
                <div className="flex-1 bg-red-50 rounded-xl px-3 py-2 text-center">
                  <p className="text-base font-bold text-red-700">{detail.generation}</p>
                  <p className="text-[10px] text-stone-500">Đời thứ</p>
                </div>
              )}
              {detail.descendantsCount != null && (
                <div className="flex-1 bg-amber-50 rounded-xl px-3 py-2 text-center">
                  <p className="text-base font-bold text-amber-700">{detail.descendantsCount}</p>
                  <p className="text-[10px] text-stone-500">Con cháu</p>
                </div>
              )}
            </div>
          )}

          {/* Ngày sinh / ngày mất */}
          <div className="space-y-1.5">
            {(detail.birthDate || detail.birthYear) && (
              <p className="text-xs text-stone-600 flex gap-1">
                <span className="font-medium text-stone-500 w-20 flex-shrink-0">Ngày sinh:</span>
                <span>
                  {detail.birthDate
                    ? new Date(detail.birthDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : detail.birthYear}
                </span>
              </p>
            )}
            {(detail.deathDate || detail.deathYear) && (
              <p className="text-xs text-stone-600 flex gap-1">
                <span className="font-medium text-stone-500 w-20 flex-shrink-0">Ngày mất:</span>
                <span>
                  {detail.deathDate
                    ? new Date(detail.deathDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : detail.deathYear}
                </span>
              </p>
            )}
            {!detail.deathDate && !detail.deathYear && (
              <p className="text-xs text-emerald-600 flex gap-1">
                <span className="font-medium text-stone-500 w-20 flex-shrink-0">Tình trạng:</span>
                <span>Còn sống</span>
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
              <p className="font-medium mb-1">Con cái ({detail.children.length}):</p>
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
          <div className="space-y-2 pt-1">
            <button
              onClick={() => onViewLineage(detail.id, detail.fullName)}
              className="block w-full text-center text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded-lg py-1.5 transition-colors"
            >
              Xem cây trực hệ
            </button>
            <a
              href={`/thanh-vien/${detail.id}`}
              className="block text-center text-xs font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg py-1.5 transition-colors"
            >
              Xem trang đầy đủ →
            </a>
          </div>
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
  const { setCenter } = useReactFlow();

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
function FamilyTreeInner({ refreshKey }: { refreshKey?: number }) {
  const searchParams = useSearchParams();
  const activeMemberId = searchParams.get('active');

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lineageTarget, setLineageTarget] = useState<{ id: string; name: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasFocused = useRef(false);
  const { setCenter } = useReactFlow();

  const allMembers = useMemo(
    () => nodes.map((n) => (n.data as MemberNodeData).member),
    [nodes],
  );

  useEffect(() => {
    setLoading(true);
    getCachedAllMembers()
      .then((members) => {
        const { nodes: n, edges: e } = flatToFlowGraph(members);
        setNodes(n as unknown as Node[]);
        setEdges(e);
      })
      .catch(() => {
        setNodes([]);
        setEdges([]);
      })
      .finally(() => setLoading(false));
  }, [setNodes, setEdges, refreshKey]);

  // Auto-focus and highlight the active member after nodes are loaded
  useEffect(() => {
    if (loading || !activeMemberId || hasFocused.current || nodes.length === 0) return;
    const node = nodes.find((n) => n.id === activeMemberId);
    if (!node) return;
    hasFocused.current = true;
    setSelectedId(activeMemberId);
    // Small delay to let ReactFlow finish layout
    const t = setTimeout(() => {
      setCenter(
        node.position.x + 96,
        node.position.y + 70,
        { zoom: 1.6, duration: 900 },
      );
    }, 120);
    return () => clearTimeout(t);
  }, [loading, activeMemberId, nodes, setCenter]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedId(node.id);
  }, []);

  const onPaneClick = useCallback(() => setSelectedId(null), []);

  if (loading) return <TreeSkeleton />;

  return (
    <ActiveMemberCtx.Provider value={activeMemberId}>
    <div ref={containerRef} className="relative w-full h-full bg-stone-50">
      <RF
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodesDraggable={false}
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
          nodeColor={(n) => (n.id === activeMemberId ? '#f59e0b' : '#e5e5e5')}
          nodeStrokeColor={(n) => (n.id === activeMemberId ? '#d97706' : '#8b1a1a')}
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
        <DetailPanel
          memberId={selectedId}
          onClose={() => setSelectedId(null)}
          onViewLineage={(id, name) => setLineageTarget({ id, name })}
        />
      )}
      {lineageTarget && (
        <LineageModal
          memberId={lineageTarget.id}
          memberName={lineageTarget.name}
          allMembers={allMembers}
          onClose={() => setLineageTarget(null)}
        />
      )}
    </div>
    </ActiveMemberCtx.Provider>
  );
}

// -------- Export --------
export default function FamilyTree({ refreshKey }: { refreshKey?: number }) {
  return (
    <ReactFlowProvider>
      <Suspense fallback={<TreeSkeleton />}>
        <FamilyTreeInner refreshKey={refreshKey} />
      </Suspense>
    </ReactFlowProvider>
  );
}
