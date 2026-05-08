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
import GenderIcon from './GenderIcon';

const ActiveMemberCtx = createContext<string | null>(null);

const RF = ReactFlow as ComponentType<ReactFlowProps>;

// -------- Custom Node --------
function MemberNode({ data, selected }: NodeProps) {
  const activeMemberId = useContext(ActiveMemberCtx);
  const { member, descendantsAchievementsCount } = data as MemberNodeData;
  const isActive = activeMemberId === member.id;
  const initials = member.fullName.split(' ').slice(-2).map((w) => w[0]).join('');
  const years = member.birthYear || member.deathYear
    ? `${member.birthYear ?? '?'} – ${member.deathYear ?? 'nay'}`
    : null;
  const isDeceased = !!(member.deathYear || member.deathDate);
  const ownAchievements = member.achievements?.length ?? 0;
  const descendantsCount = member.descendantsCount ?? 0;

  return (
    <div
      className="relative rounded-xl px-3 py-2 w-48 cursor-pointer transition-all"
      style={{
        background: 'var(--t-surface)',
        border: `2px solid ${isActive ? 'var(--t-accent)' : selected ? 'var(--t-accent)' : 'var(--t-border)'}`,
        opacity: selected && !isActive ? 0.9 : 1,
      }}
    >
      {/* Active beacon */}
      {isActive && (
        <span
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap leading-tight"
          style={{ background: 'var(--t-accent)', color: 'var(--t-nav-active-text)' }}
        >
          Đang xem
        </span>
      )}

      <Handle type="target" position={Position.Top} style={{ background: 'var(--t-accent)', width: 8, height: 8 }} />

      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          {member.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.avatar}
              alt={member.fullName}
              className="w-11 h-11 rounded-full object-cover"
              style={{ border: `2px solid ${isActive ? 'var(--t-accent)' : 'var(--t-border)'}` }}
            />
          ) : (
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: 'var(--t-accent)', color: 'var(--t-nav-active-text)' }}
            >
              {initials}
            </div>
          )}
          <GenderIcon gender={member.gender} className="absolute -bottom-0.5 -left-0.5" />
          {isDeceased && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
              style={{ background: 'var(--t-text-3)', border: '1px solid var(--t-surface)' }}
            >
              <span className="text-[6px] leading-none font-bold" style={{ color: 'var(--t-nav-active-text)' }}>✝</span>
            </div>
          )}
        </div>

        <p
          className="text-xs font-semibold leading-tight line-clamp-2 text-center"
          style={{ color: isActive ? 'var(--t-accent)' : 'var(--t-text)' }}
        >
          {member.fullName}
        </p>
        {years && (
          <p className="text-[10px] leading-none" style={{ color: 'var(--t-text-3)' }}>{years}</p>
        )}
      </div>

      {/* Stats row */}
      <div
        className="flex items-center justify-between mt-1.5 pt-1.5"
        style={{ borderTop: '1px solid var(--t-border)' }}
      >
        <div className="flex items-center gap-0.5 text-[9px]" style={{ color: 'var(--t-text-3)' }}>
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
          </svg>
          <span className="font-semibold" style={{ color: 'var(--t-text-2)' }}>{descendantsCount}</span>
        </div>
        <div className="flex items-center gap-1 text-[9px]">
          <span className="font-semibold" style={{ color: 'var(--t-accent)' }}>{ownAchievements}</span>
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--t-accent)' }}>
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span style={{ color: 'var(--t-border)' }}>·</span>
          <span className="font-semibold" style={{ color: 'var(--t-text-3)' }}>{descendantsAchievementsCount}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--t-accent)', width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes = { memberNode: MemberNode };

// -------- Detail Panel --------
function DetailPanel({
  memberId,
  onClose,
  onViewLineage,
  onEditMember,
  onReorderSiblings,
}: {
  memberId: string;
  onClose: () => void;
  onViewLineage: (id: string, name: string) => void;
  onEditMember?: (id: string) => void;
  onReorderSiblings?: (member: Member) => void;
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
    <div
      className="absolute top-4 right-4 z-10 w-72 rounded-2xl overflow-hidden"
      style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'var(--t-accent)' }}
      >
        <h3 className="font-semibold text-sm" style={{ color: 'var(--t-nav-active-text)' }}>Thông tin thành viên</h3>
        <button
          onClick={onClose}
          className="text-lg leading-none transition-opacity hover:opacity-70"
          style={{ color: 'var(--t-nav-active-text)' }}
          aria-label="Đóng"
        >
          ×
        </button>
      </div>

      {loading ? (
        <div className="p-4 space-y-3 animate-pulse">
          <div className="w-16 h-16 rounded-full mx-auto" style={{ background: 'var(--t-surface-2)' }} />
          <div className="h-4 rounded w-3/4 mx-auto" style={{ background: 'var(--t-surface-2)' }} />
          <div className="h-20 rounded" style={{ background: 'var(--t-surface-2)' }} />
        </div>
      ) : detail ? (
        <div className="p-4 space-y-3 overflow-y-auto max-h-96">
          <div className="flex flex-col items-center gap-2">
            {detail.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={detail.avatar}
                alt={detail.fullName}
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: '2px solid var(--t-border)' }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg"
                style={{ background: 'var(--t-accent)', color: 'var(--t-nav-active-text)' }}
              >
                {detail.fullName.split(' ').slice(-2).map((w) => w[0]).join('')}
              </div>
            )}
            <h4 className="font-bold text-center" style={{ color: 'var(--t-text)' }}>{detail.fullName}</h4>
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--t-text-3)' }}>
              <GenderIcon gender={detail.gender} />
              {detail.gender ? <span>{detail.gender}</span> : null}
            </div>
          </div>

          {(detail.generation != null || detail.descendantsCount != null) && (
            <div className="flex gap-2">
              {detail.generation != null && (
                <div
                  className="flex-1 rounded-xl px-3 py-2 text-center"
                  style={{ background: 'color-mix(in oklch, var(--t-accent) 8%, var(--t-surface))' }}
                >
                  <p className="text-base font-bold" style={{ color: 'var(--t-accent)' }}>{detail.generation}</p>
                  <p className="text-[10px]" style={{ color: 'var(--t-text-3)' }}>Đời thứ</p>
                </div>
              )}
              {detail.descendantsCount != null && (
                <div
                  className="flex-1 rounded-xl px-3 py-2 text-center"
                  style={{ background: 'color-mix(in oklch, var(--t-accent) 5%, var(--t-surface))' }}
                >
                  <p className="text-base font-bold" style={{ color: 'var(--t-accent)' }}>{detail.descendantsCount}</p>
                  <p className="text-[10px]" style={{ color: 'var(--t-text-3)' }}>Con cháu</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            {(detail.birthDate || detail.birthYear) && (
              <p className="text-xs flex gap-1" style={{ color: 'var(--t-text-2)' }}>
                <span className="font-medium w-20 flex-shrink-0" style={{ color: 'var(--t-text-3)' }}>Ngày sinh:</span>
                <span>{detail.birthDate ? new Date(detail.birthDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : detail.birthYear}</span>
              </p>
            )}
            {(detail.deathDate || detail.deathYear) && (
              <p className="text-xs flex gap-1" style={{ color: 'var(--t-text-2)' }}>
                <span className="font-medium w-20 flex-shrink-0" style={{ color: 'var(--t-text-3)' }}>Ngày mất:</span>
                <span>{detail.deathDate ? new Date(detail.deathDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : detail.deathYear}</span>
              </p>
            )}
            {!detail.deathDate && !detail.deathYear && (
              <p className="text-xs flex gap-1">
                <span className="font-medium w-20 flex-shrink-0" style={{ color: 'var(--t-text-3)' }}>Tình trạng:</span>
                <span style={{ color: 'var(--t-success)' }}>Còn sống</span>
              </p>
            )}
          </div>

          {detail.parent && (
            <p className="text-xs" style={{ color: 'var(--t-text-2)' }}>
              <span className="font-medium">Cha/Mẹ: </span>
              <a href={`/thanh-vien/${detail.parent.id}`} className="hover:underline" style={{ color: 'var(--t-accent)' }}>
                {detail.parent.fullName}
              </a>
            </p>
          )}
          {detail.children.length > 0 && (
            <div className="text-xs" style={{ color: 'var(--t-text-2)' }}>
              <p className="font-medium mb-1">Con cái ({detail.children.length}):</p>
              <ul className="space-y-0.5 pl-2">
                {detail.children.map((c) => (
                  <li key={c.id}>
                    <a href={`/thanh-vien/${c.id}`} className="hover:underline" style={{ color: 'var(--t-accent)' }}>
                      {c.fullName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {detail.bio && (
            <p className="text-xs leading-relaxed" style={{ color: 'var(--t-text-2)' }}>{detail.bio}</p>
          )}

          <div className="space-y-2 pt-1">
            {onEditMember && (
              <button
                onClick={() => onEditMember(detail.id)}
                className="block w-full text-center text-xs font-medium rounded-lg py-1.5 transition-opacity hover:opacity-80"
                style={{ background: 'var(--t-info)', color: 'var(--t-nav-active-text)' }}
              >
                Sửa thông tin
              </button>
            )}
            {onReorderSiblings && detail.parentId && (detail.siblingsCount ?? 0) > 0 && (
              <button
                onClick={() => onReorderSiblings(detail)}
                className="block w-full text-center text-xs font-medium rounded-lg py-1.5 transition-opacity hover:opacity-80"
                style={{ background: 'var(--t-success)', color: 'var(--t-nav-active-text)' }}
              >
                Sắp xếp thứ tự anh chị em
              </button>
            )}
            <button
              onClick={() => onViewLineage(detail.id, detail.fullName)}
              className="block w-full text-center text-xs font-medium rounded-lg py-1.5 transition-opacity hover:opacity-80"
              style={{ background: 'var(--t-accent)', color: 'var(--t-nav-active-text)' }}
            >
              Xem cây trực hệ
            </button>
            <a
              href={`/thanh-vien/${detail.id}`}
              className="block text-center text-xs font-medium rounded-lg py-1.5 transition-opacity hover:opacity-80"
              style={{ background: 'var(--t-accent)', color: 'var(--t-nav-active-text)', opacity: 0.85 }}
            >
              Xem trang đầy đủ →
            </a>
          </div>
        </div>
      ) : (
        <p className="p-4 text-xs text-center" style={{ color: 'var(--t-text-3)' }}>Không tìm thấy thông tin.</p>
      )}
    </div>
  );
}

// -------- Loading Skeleton --------
function TreeSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--t-surface-2)' }}>
      <div className="text-center space-y-4">
        <div className="flex gap-6 justify-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-48 h-20 rounded-xl animate-pulse" style={{ background: 'var(--t-border)' }} />
          ))}
        </div>
        <p className="text-sm" style={{ color: 'var(--t-text-3)' }}>Đang tải gia phả...</p>
      </div>
    </div>
  );
}

// -------- Tree Search --------
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
          onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          placeholder="Tìm nhanh thành viên..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
          style={{
            background: 'var(--t-surface)',
            border: '1px solid var(--t-border)',
            color: 'var(--t-text)',
          }}
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--t-text-3)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {showResults && query && (
          <div
            className="absolute top-full mt-2 w-full rounded-xl max-h-60 overflow-y-auto"
            style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}
          >
            {filtered.length === 0 ? (
              <div className="p-3 text-xs text-center" style={{ color: 'var(--t-text-3)' }}>Không tìm thấy ai</div>
            ) : (
              <ul className="py-1">
                {filtered.map(n => {
                  const m = (n.data as MemberNodeData).member;
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => handleSelect(n)}
                        className="w-full text-left px-4 py-2 text-sm flex flex-col transition-colors"
                        style={{ color: 'var(--t-text)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'color-mix(in oklch, var(--t-accent) 6%, var(--t-surface))'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <span className="font-semibold">{m.fullName}</span>
                        <span className="text-[10px]" style={{ color: 'var(--t-text-3)' }}>
                          {m.birthYear ? `SN: ${m.birthYear}` : ''} {m.chiId ? `| Chi: ${m.chiId.slice(0, 6)}` : ''}
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
function FamilyTreeInner({ refreshKey, onEditMember, onDeleteMember, onReorderSiblings }: { refreshKey?: number; onEditMember?: (id: string) => void; onDeleteMember?: (id: string) => Promise<void>; onReorderSiblings?: (member: Member) => void }) {
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

  const allMembers = useMemo(() => nodes.map((n) => (n.data as MemberNodeData).member), [nodes]);

  useEffect(() => {
    setLoading(true);
    getCachedAllMembers()
      .then((members) => {
        const { nodes: n, edges: e } = flatToFlowGraph(members);
        setNodes(n as unknown as Node[]);
        setEdges(e);
      })
      .catch(() => { setNodes([]); setEdges([]); })
      .finally(() => setLoading(false));
  }, [setNodes, setEdges, refreshKey]);

  useEffect(() => {
    if (loading || !activeMemberId || hasFocused.current || nodes.length === 0) return;
    const node = nodes.find((n) => n.id === activeMemberId);
    if (!node) return;
    hasFocused.current = true;
    setSelectedId(activeMemberId);
    const t = setTimeout(() => {
      setCenter(node.position.x + 96, node.position.y + 70, { zoom: 1.6, duration: 900 });
    }, 120);
    return () => clearTimeout(t);
  }, [loading, activeMemberId, nodes, setCenter]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => { setSelectedId(node.id); }, []);
  const onPaneClick = useCallback(() => setSelectedId(null), []);

  if (loading) return <TreeSkeleton />;

  return (
    <ActiveMemberCtx.Provider value={activeMemberId}>
      <div ref={containerRef} className="relative w-full h-full" style={{ background: 'var(--t-surface-2)' }}>
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
          style={{ background: 'var(--t-surface-2)' }}
        >
          <Background color="var(--t-border)" gap={24} size={1} />
          <Controls />
          <MiniMap
            maskColor="color-mix(in oklch, var(--t-surface-2) 80%, transparent)"
            pannable
            zoomable
            nodeColor={(n) => (n.id === activeMemberId ? 'var(--t-accent)' : 'var(--t-border)')}
            nodeStrokeColor={() => 'var(--t-accent)'}
          />

          <TreeSearch nodes={nodes} onSelect={setSelectedId} />

          {/* Fullscreen button */}
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  containerRef.current?.requestFullscreen().catch(err => console.error(err.message));
                } else {
                  document.exitFullscreen();
                }
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{
                background: 'var(--t-surface)',
                border: '1px solid var(--t-border)',
                color: 'var(--t-text-2)',
              }}
              title="Xem toàn màn hình"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            onEditMember={onEditMember}
            onReorderSiblings={onReorderSiblings}
          />
        )}
        {lineageTarget && (
          <LineageModal
            memberId={lineageTarget.id}
            memberName={lineageTarget.name}
            allMembers={allMembers}
            onClose={() => setLineageTarget(null)}
            onEditMember={onEditMember}
            onDeleteMember={onDeleteMember}
            onReorderSiblings={onReorderSiblings}
          />
        )}
      </div>
    </ActiveMemberCtx.Provider>
  );
}

export default function FamilyTree({ refreshKey, onEditMember, onDeleteMember, onReorderSiblings }: { refreshKey?: number; onEditMember?: (id: string) => void; onDeleteMember?: (id: string) => Promise<void>; onReorderSiblings?: (member: Member) => void }) {
  return (
    <ReactFlowProvider>
      <Suspense fallback={<TreeSkeleton />}>
        <FamilyTreeInner refreshKey={refreshKey} onEditMember={onEditMember} onDeleteMember={onDeleteMember} onReorderSiblings={onReorderSiblings} />
      </Suspense>
    </ReactFlowProvider>
  );
}
