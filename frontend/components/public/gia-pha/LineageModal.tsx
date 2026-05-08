'use client';

import { useMemo, useCallback, useState, createContext, useContext } from 'react';
import type { ComponentType } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Handle,
  Position,
  useReactFlow,
  type ReactFlowInstance,
  type NodeProps,
  type ReactFlowProps,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { flatToFlowGraph, getLineageMembers } from '@/lib/treeUtils';
import type { MemberNodeData } from '@/lib/treeUtils';
import type { Member } from '@/types';
import GenderIcon from './GenderIcon';

const RF = ReactFlow as ComponentType<ReactFlowProps>;

const FocusMemberCtx = createContext<string>('');

function MemberNode({ data, selected }: NodeProps) {
  const focusMemberId = useContext(FocusMemberCtx);
  const { member, descendantsAchievementsCount } = data as MemberNodeData;
  const isActive = member.id === focusMemberId;

  const initials = member.fullName
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('');

  const isDeceased = !!(member.deathYear || member.deathDate);
  const ownAchievements = member.achievements?.length ?? 0;
  const descendantsCount = member.descendantsCount ?? 0;

  const lifespan = (() => {
    if (member.birthYear || member.deathYear) {
      return `${member.birthYear ?? '?'} – ${member.deathYear ?? 'nay'}`;
    }
    const parts: string[] = [];
    if (member.birthDate) parts.push(member.birthDate);
    if (member.deathDate) parts.push(`✝ ${member.deathDate}`);
    return parts.join('  ') || null;
  })();

  const nodeStyle: React.CSSProperties = isActive
    ? {
        background: 'var(--t-surface)',
        borderColor: 'var(--t-accent)',
        boxShadow: '0 0 0 3px color-mix(in oklch, var(--t-accent) 25%, transparent)',
        outline: 'none',
      }
    : selected
    ? {
        background: 'var(--t-surface)',
        borderColor: 'var(--t-accent)',
        boxShadow: '0 0 0 2px color-mix(in oklch, var(--t-accent) 15%, transparent)',
        outline: 'none',
      }
    : {
        background: 'var(--t-surface)',
        borderColor: 'var(--t-border)',
        outline: 'none',
      };

  return (
    <div
      className="relative border-2 rounded-xl px-3 py-2 w-48 cursor-pointer transition-all"
      style={nodeStyle}
    >
      {isActive && (
        <span
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap leading-tight z-10"
          style={{ background: 'var(--t-accent)', color: 'var(--t-nav-active-text)' }}
        >
          Đang xem
        </span>
      )}

      <Handle type="target" position={Position.Top} className="!w-2 !h-2" style={{ background: 'var(--t-accent)' }} />

      <div className="flex flex-col items-center gap-1">
        <div className="relative">
          {member.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.avatar}
              alt={member.fullName}
              className="w-11 h-11 rounded-full object-cover border-2"
              style={{ borderColor: isActive ? 'var(--t-accent)' : 'var(--t-border)' }}
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
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center"
              style={{ background: 'var(--t-text-3)', borderColor: 'var(--t-surface)' }}
            >
              <span className="text-[6px] leading-none font-bold" style={{ color: 'var(--t-nav-active-text)' }}>✝</span>
            </div>
          )}
        </div>

        <p
          className="text-xs font-semibold leading-tight line-clamp-2 text-center"
          style={{ color: 'var(--t-text)' }}
        >
          {member.fullName}
        </p>

        {lifespan && (
          <p className="text-[10px] leading-none text-center" style={{ color: 'var(--t-text-3)' }}>
            {lifespan}
          </p>
        )}

        {member.generation != null && (
          <span className="text-[9px] leading-none" style={{ color: 'var(--t-text-3)' }}>
            Đời {member.generation}
          </span>
        )}
      </div>

      <div
        className="flex items-center justify-between mt-1.5 pt-1.5 border-t"
        style={{ borderColor: 'var(--t-border)' }}
      >
        <div className="flex items-center gap-0.5 text-[9px]" title="Số con cháu">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--t-text-3)' }}>
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
          </svg>
          <span className="font-semibold" style={{ color: 'var(--t-text-2)' }}>{descendantsCount}</span>
        </div>
        <div className="flex items-center gap-1 text-[9px]" title="Thành tích cá nhân · Thành tích con cháu">
          <span className="font-semibold" style={{ color: 'var(--t-accent)' }}>{ownAchievements}</span>
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--t-accent)' }}>
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span style={{ color: 'var(--t-border)' }}>·</span>
          <span className="font-semibold" style={{ color: 'var(--t-text-3)' }}>{descendantsAchievementsCount}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2" style={{ background: 'var(--t-accent)' }} />
    </div>
  );
}

const nodeTypes = { memberNode: MemberNode };

// -------- Search --------
function LineageSearch({ nodes, onSelect }: { nodes: Node[]; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { setCenter } = useReactFlow();

  const filtered = query
    ? nodes
        .filter((n) => {
          const member = (n.data as MemberNodeData).member;
          return member.fullName.toLowerCase().includes(query.toLowerCase());
        })
        .slice(0, 10)
    : [];

  const handleSelect = (node: Node) => {
    setQuery('');
    setShowResults(false);
    onSelect(node.id);
    setCenter(node.position.x + 100, node.position.y + 60, { zoom: 1.5, duration: 800 });
  };

  return (
    <div className="absolute top-4 left-14 z-10">
      <div className="relative w-60">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          placeholder="Tìm trong cây trực hệ..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none"
          style={{
            background: 'var(--t-surface)',
            borderColor: 'var(--t-border)',
            color: 'var(--t-text)',
          }}
          onFocusCapture={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--t-accent)'; }}
          onBlurCapture={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--t-border)'; }}
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          style={{ color: 'var(--t-text-3)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {showResults && query && (
          <div
            className="absolute top-full mt-2 w-full rounded-xl border max-h-52 overflow-y-auto"
            style={{ background: 'var(--t-surface)', borderColor: 'var(--t-border)' }}
          >
            {filtered.length === 0 ? (
              <div className="p-3 text-xs text-center" style={{ color: 'var(--t-text-3)' }}>
                Không tìm thấy ai
              </div>
            ) : (
              <ul className="py-1">
                {filtered.map((n) => {
                  const m = (n.data as MemberNodeData).member;
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => handleSelect(n)}
                        className="w-full text-left px-4 py-2 text-sm flex flex-col transition-colors"
                        style={{ color: 'var(--t-text)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--t-surface-2)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <span className="font-semibold">{m.fullName}</span>
                        <span className="text-[10px]" style={{ color: 'var(--t-text-3)' }}>
                          {m.birthYear ? `SN: ${m.birthYear}` : ''}
                          {m.generation != null ? ` · Đời ${m.generation}` : ''}
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

// -------- Inner Tree --------
function LineageTreeInner({
  lineageMembers,
  focusMemberId,
  onEditMember,
  onDeleteMember,
  onReorderSiblings,
}: {
  lineageMembers: Member[];
  focusMemberId: string;
  onEditMember?: (id: string) => void;
  onDeleteMember?: (id: string) => Promise<void>;
  onReorderSiblings?: (member: Member) => void;
}) {
  const { nodes, edges } = useMemo(() => flatToFlowGraph(lineageMembers), [lineageMembers]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedMember = useMemo(
    () => (selectedId ? lineageMembers.find((m) => m.id === selectedId) ?? null : null),
    [selectedId, lineageMembers],
  );

  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      instance.fitView({ padding: 0.3 });
      setTimeout(() => {
        instance.fitView({
          nodes: [{ id: focusMemberId }],
          padding: 0.6,
          duration: 800,
          maxZoom: 1.6,
        });
      }, 400);
    },
    [focusMemberId],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedId((prev) => {
      if (prev === node.id) return null;
      setConfirmingDelete(false);
      return node.id;
    });
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedId(null);
    setConfirmingDelete(false);
  }, []);

  const handleDelete = async () => {
    if (!selectedId || !onDeleteMember) return;
    setDeleting(true);
    try {
      await onDeleteMember(selectedId);
      setSelectedId(null);
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <FocusMemberCtx.Provider value={focusMemberId}>
      <RF
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        onInit={handleInit}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        minZoom={0.05}
        maxZoom={3}
        style={{ background: 'var(--t-surface-2)' }}
      >
        <Background color="var(--t-border)" gap={24} size={1} />
        <Controls />
        <MiniMap
          maskColor="color-mix(in oklch, var(--t-surface-2) 80%, transparent)"
          nodeColor={(n) => (n.id === focusMemberId ? 'var(--t-accent)' : 'var(--t-border)')}
          nodeStrokeColor={(n) => (n.id === focusMemberId ? 'var(--t-accent-2)' : 'var(--t-border)')}
          pannable
          zoomable
        />

        {/* Search */}
        <LineageSearch nodes={nodes as Node[]} onSelect={setSelectedId} />

        {/* Selected member action bar */}
        {selectedMember && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 rounded-2xl border px-4 py-3 flex items-center gap-3 max-w-md w-full"
            style={{
              background: 'var(--t-surface)',
              borderColor: 'var(--t-border)',
            }}
          >
            {confirmingDelete ? (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold" style={{ color: 'var(--t-accent)' }}>
                    Xóa thành viên này?
                  </p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--t-text-3)' }}>
                    {selectedMember.fullName}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                  style={{ background: 'var(--t-surface-2)', color: 'var(--t-text-2)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--t-border)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--t-surface-2)'; }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                  style={{ background: 'var(--t-accent)', color: 'var(--t-nav-active-text)' }}
                >
                  {deleting ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: 'var(--t-text)' }}>
                    {selectedMember.fullName}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--t-text-3)' }}>
                    {selectedMember.gender ? `${selectedMember.gender}` : ''}
                    {selectedMember.gender && (selectedMember.birthYear || selectedMember.generation != null) ? ' · ' : ''}
                    {selectedMember.birthYear ? `SN: ${selectedMember.birthYear}` : ''}
                    {selectedMember.generation != null
                      ? `${selectedMember.birthYear ? ' · ' : ''}Đời ${selectedMember.generation}`
                      : ''}
                    {!selectedMember.birthYear && selectedMember.generation == null ? 'Thành viên được chọn' : ''}
                  </p>
                </div>
                {onEditMember && (
                  <button
                    onClick={() => onEditMember(selectedMember.id)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                    style={{ background: 'var(--t-accent)', color: 'var(--t-nav-active-text)' }}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Sửa
                  </button>
                )}
                {onReorderSiblings && selectedMember.parentId && (selectedMember.siblingsCount ?? 0) > 0 && (
                  <button
                    onClick={() => onReorderSiblings(selectedMember)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                    style={{ background: 'var(--t-success)', color: 'var(--t-nav-active-text)' }}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M7 12h10M11 17h2" />
                    </svg>
                    Sắp xếp anh em
                  </button>
                )}
                {onDeleteMember && (
                  <button
                    onClick={() => setConfirmingDelete(true)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                    style={{ background: 'var(--t-accent)', color: 'var(--t-nav-active-text)' }}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xóa
                  </button>
                )}
                <button
                  onClick={() => setSelectedId(null)}
                  className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'var(--t-surface-2)', color: 'var(--t-text-3)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--t-border)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--t-text-2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--t-surface-2)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--t-text-3)';
                  }}
                  aria-label="Bỏ chọn"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </RF>
    </FocusMemberCtx.Provider>
  );
}

interface LineageModalProps {
  memberId: string;
  memberName: string;
  allMembers: Member[];
  onClose: () => void;
  onEditMember?: (id: string) => void;
  onDeleteMember?: (id: string) => Promise<void>;
  onReorderSiblings?: (member: Member) => void;
}

export default function LineageModal({ memberId, memberName, allMembers, onClose, onEditMember, onDeleteMember, onReorderSiblings }: LineageModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(true);

  const lineageMembers = useMemo(() => getLineageMembers(memberId, allMembers), [memberId, allMembers]);

  const generations = useMemo(() => {
    const gens = lineageMembers.map((m) => m.generation).filter((g): g is number => g != null);
    if (gens.length === 0) return null;
    return Math.max(...gens) - Math.min(...gens) + 1;
  }, [lineageMembers]);

  const totalAchievements = useMemo(
    () => lineageMembers.reduce((sum, m) => sum + (m.achievements?.length ?? 0), 0),
    [lineageMembers],
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all ${
        isFullscreen ? 'p-0' : 'p-4'
      }`}
    >
      <div
        className={`flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-5xl h-[85vh] rounded-2xl'
        }`}
        style={{ background: 'var(--t-surface)' }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between flex-shrink-0"
          style={{ background: 'var(--t-accent)' }}
        >
          <div>
            <h3 className="font-semibold text-base" style={{ color: 'var(--t-nav-active-text)' }}>
              Cây trực hệ — {memberName}
            </h3>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs" style={{ color: 'color-mix(in oklch, var(--t-nav-active-text) 80%, transparent)' }}>
                {lineageMembers.length} thành viên
              </span>
              {generations != null && (
                <>
                  <span className="text-xs" style={{ color: 'color-mix(in oklch, var(--t-nav-active-text) 40%, transparent)' }}>·</span>
                  <span className="text-xs" style={{ color: 'color-mix(in oklch, var(--t-nav-active-text) 80%, transparent)' }}>
                    {generations} đời
                  </span>
                </>
              )}
              {totalAchievements > 0 && (
                <>
                  <span className="text-xs" style={{ color: 'color-mix(in oklch, var(--t-nav-active-text) 40%, transparent)' }}>·</span>
                  <span className="text-xs" style={{ color: 'color-mix(in oklch, var(--t-nav-active-text) 80%, transparent)' }}>
                    {totalAchievements} thành tích
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen((v) => !v)}
              className="transition-colors w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ color: 'color-mix(in oklch, var(--t-nav-active-text) 80%, transparent)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--t-nav-active-text)';
                (e.currentTarget as HTMLElement).style.background = 'color-mix(in oklch, var(--t-nav-active-text) 10%, transparent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'color-mix(in oklch, var(--t-nav-active-text) 80%, transparent)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
              aria-label={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25M9 15H4.5M9 15v4.5M9 15l-5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              className="transition-colors w-8 h-8 flex items-center justify-center rounded-lg text-xl leading-none"
              style={{ color: 'color-mix(in oklch, var(--t-nav-active-text) 80%, transparent)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--t-nav-active-text)';
                (e.currentTarget as HTMLElement).style.background = 'color-mix(in oklch, var(--t-nav-active-text) 10%, transparent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'color-mix(in oklch, var(--t-nav-active-text) 80%, transparent)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
              aria-label="Đóng"
            >
              ×
            </button>
          </div>
        </div>

        {/* Legend */}
        <div
          className="flex items-center gap-4 px-4 py-2 border-b text-[10px] flex-shrink-0"
          style={{
            background: 'var(--t-surface-2)',
            borderColor: 'var(--t-border)',
            color: 'var(--t-text-3)',
          }}
        >
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--t-text-3)' }}>
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
            </svg>
            <span>Số con cháu</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--t-accent)' }}>
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>
              <span className="font-semibold" style={{ color: 'var(--t-accent)' }}>Thành tích</span>
              {' · Con cháu'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ background: 'var(--t-accent)' }}
            />
            <span>Thành viên đang xem</span>
          </div>
          {(onEditMember || onDeleteMember) && (
            <div className="flex items-center gap-1 ml-auto" style={{ color: 'var(--t-accent)' }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
              </svg>
              <span>Nhấn vào thành viên để {onEditMember && onDeleteMember ? 'sửa / xóa' : onEditMember ? 'sửa' : 'xóa'}</span>
            </div>
          )}
        </div>

        {/* Tree */}
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <LineageTreeInner
              lineageMembers={lineageMembers}
              focusMemberId={memberId}
              onEditMember={onEditMember}
              onDeleteMember={onDeleteMember}
              onReorderSiblings={onReorderSiblings}
            />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}
