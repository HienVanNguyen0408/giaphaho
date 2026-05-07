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
  type ReactFlowInstance,
  type NodeProps,
  type ReactFlowProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { flatToFlowGraph, getLineageMembers } from '@/lib/treeUtils';
import type { MemberNodeData } from '@/lib/treeUtils';
import type { Member } from '@/types';

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

  // Hiển thị ngày/năm sinh-mất
  const lifespan = (() => {
    if (member.birthYear || member.deathYear) {
      return `${member.birthYear ?? '?'} – ${member.deathYear ?? 'nay'}`;
    }
    const parts: string[] = [];
    if (member.birthDate) parts.push(member.birthDate);
    if (member.deathDate) parts.push(`✝ ${member.deathDate}`);
    return parts.join('  ') || null;
  })();

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
      {/* Active badge */}
      {isActive && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm leading-tight z-10">
          Đang xem
        </span>
      )}

      <Handle type="target" position={Position.Top} className="!bg-red-400 !w-2 !h-2" />

      {/* Avatar + tên */}
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

        {lifespan && (
          <p className="text-[10px] text-stone-400 leading-none text-center">{lifespan}</p>
        )}

        {member.generation != null && (
          <span className="text-[9px] text-stone-400 leading-none">Đời {member.generation}</span>
        )}
      </div>

      {/* Stats row: con cháu | thành tích bản thân · thành tích con cháu */}
      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-stone-100">
        {/* Số con cháu */}
        <div className="flex items-center gap-0.5 text-[9px] text-stone-500" title="Số con cháu">
          <svg className="w-2.5 h-2.5 text-stone-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
          </svg>
          <span className="font-semibold text-stone-700">{descendantsCount}</span>
        </div>

        {/* Thành tích bản thân | thành tích con cháu */}
        <div className="flex items-center gap-1 text-[9px]" title="Thành tích cá nhân · Thành tích con cháu">
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

function LineageTreeInner({
  lineageMembers,
  focusMemberId,
}: {
  lineageMembers: Member[];
  focusMemberId: string;
}) {
  const { nodes, edges } = useMemo(() => flatToFlowGraph(lineageMembers), [lineageMembers]);

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

  return (
    <FocusMemberCtx.Provider value={focusMemberId}>
      <RF
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        onInit={handleInit}
        minZoom={0.05}
        maxZoom={3}
        className="bg-stone-50"
      >
        <Background color="#d6d3d1" gap={24} size={1} />
        <Controls />
        <MiniMap
          maskColor="rgba(250, 250, 249, 0.8)"
          nodeColor={(n) => (n.id === focusMemberId ? '#f59e0b' : '#e5e5e5')}
          nodeStrokeColor={(n) => (n.id === focusMemberId ? '#d97706' : '#8b1a1a')}
          pannable
          zoomable
        />
      </RF>
    </FocusMemberCtx.Provider>
  );
}

interface LineageModalProps {
  memberId: string;
  memberName: string;
  allMembers: Member[];
  onClose: () => void;
}

export default function LineageModal({ memberId, memberName, allMembers, onClose }: LineageModalProps) {
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
        className={`bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-5xl h-[85vh] rounded-2xl'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-amber-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-white font-semibold text-base">Cây trực hệ — {memberName}</h3>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-white/80 text-xs">{lineageMembers.length} thành viên</span>
              {generations != null && (
                <>
                  <span className="text-white/40 text-xs">·</span>
                  <span className="text-white/80 text-xs">{generations} đời</span>
                </>
              )}
              {totalAchievements > 0 && (
                <>
                  <span className="text-white/40 text-xs">·</span>
                  <span className="text-white/80 text-xs">{totalAchievements} thành tích</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Toggle fullscreen/windowed */}
            <button
              onClick={() => setIsFullscreen((v) => !v)}
              className="text-white/80 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
              aria-label={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? (
                /* Thu nhỏ icon */
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25M9 15H4.5M9 15v4.5M9 15l-5.25 5.25" />
                </svg>
              ) : (
                /* Toàn màn hình icon */
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>
            {/* Đóng */}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-xl leading-none"
              aria-label="Đóng"
            >
              ×
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 bg-stone-50 border-b border-stone-100 text-[10px] text-stone-500">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-stone-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
            </svg>
            <span>Số con cháu</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span><span className="text-amber-700 font-semibold">Thành tích</span> · Con cháu</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span>Thành viên đang xem</span>
          </div>
        </div>

        {/* Tree */}
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <LineageTreeInner lineageMembers={lineageMembers} focusMemberId={memberId} />
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
}
