'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { deleteMember, recalculateMemberStats, subscribeRecalculateEvents } from '@/lib/api';
import {
  getCachedAllMembers,
  getPageCache,
  isPageCacheFresh,
  revalidatePage,
  invalidateMembersCache,
} from '@/lib/memberCache';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FamilyTree from '@/components/public/gia-pha/FamilyTree';
import LineageModal from '@/components/public/gia-pha/LineageModal';
import EditMemberDrawer from '@/components/admin/gia-pha/EditMemberDrawer';
import type { Member, PaginatedResponse } from '@/types';

function AvatarCell({ member }: { member: Member }) {
  if (member.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.avatar}
        alt={member.fullName}
        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
        style={{ border: '1px solid var(--t-border)' }}
      />
    );
  }
  const initials = member.fullName
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const colors = ['var(--t-accent)', 'var(--t-warning)', 'var(--t-info)', '#065f46', '#6d28d9'];
  const color = colors[member.fullName.charCodeAt(0) % colors.length];
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

function formatDayMonth(str: string | null | undefined): string {
  if (!str) return '—';
  const parts = str.split('/');
  if (parts.length === 2 && parts[0] && parts[1]) {
    return `${parts[0]}/${parts[1]}`;
  }
  return str;
}

function DateCell({ date, year }: { date: string | null; year: number | null }) {
  const val = date ? formatDayMonth(date) : year ? String(year) : null;
  if (!val) return <span className="text-stone-300">—</span>;
  return <span className="text-stone-600 text-xs tabular-nums">{val}</span>;
}

function GenderBadge({ gender }: { gender: string | null }) {
  if (!gender) return <span className="text-stone-300">—</span>;
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={
        gender === 'Nam'
          ? { background: 'color-mix(in oklch, var(--t-info) 10%, transparent)', color: 'var(--t-info)' }
          : { background: 'rgba(236,72,153,0.1)', color: '#ec4899' }
      }
    >
      {gender}
    </span>
  );
}

const PAGE_SIZE = 12;

const STEP_LABELS: Record<string, string> = {
  loading: 'Đang tải danh sách thành viên...',
  computing: 'Đang tính toán số liệu...',
  saving: 'Đang lưu kết quả...',
};

function RecalcProgressBanner({
  progress,
}: {
  progress: { step: string; processed: number; total: number };
}) {
  const pct = progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;
  const label = STEP_LABELS[progress.step] ?? 'Đang xử lý...';

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <svg className="w-4 h-4 animate-spin text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-xs font-bold text-amber-700 tabular-nums">
          {progress.step === 'saving' && progress.total > 0
            ? `${progress.processed} / ${progress.total}`
            : `${pct}%`}
        </span>
      </div>
      <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-300"
          style={{ width: progress.step === 'loading' ? '5%' : progress.step === 'computing' ? '35%' : `${Math.max(35, pct)}%` }}
        />
      </div>
    </div>
  );
}

export default function GiaPhaAdminPage() {
  const [pagedData, setPagedData] = useState<PaginatedResponse<Member> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const [debouncedName, setDebouncedName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'tree'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [lineageTarget, setLineageTarget] = useState<{ id: string; name: string } | null>(null);
  const [lineageMembers, setLineageMembers] = useState<Member[]>([]);
  const [lineageLoading, setLineageLoading] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [recalcProgress, setRecalcProgress] = useState<{
    step: string;
    processed: number;
    total: number;
  } | null>(null);
  const [recalcDone, setRecalcDone] = useState<{ updated: number; durationMs: number } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const esRef = useRef<EventSource | null>(null);

  // Cleanup EventSource on unmount
  useEffect(() => () => { esRef.current?.close(); }, []);

  // Debounce filter input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedName(filterName), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filterName]);

  // Reset to page 1 when filter changes
  useEffect(() => { setCurrentPage(1); }, [debouncedName]);

  // SWR page fetch: show stale data immediately, revalidate in background
  useEffect(() => {
    if (viewMode === 'tree') return;

    const name = debouncedName || undefined;

    // 1. Serve stale data instantly (no skeleton if we have anything cached)
    const stale = getPageCache(currentPage, PAGE_SIZE, name);
    if (stale) {
      setPagedData(stale);
      setLoading(false);
    } else {
      setLoading(true);
    }

    // 2. Skip network hit when cache is still fresh
    if (isPageCacheFresh(currentPage, PAGE_SIZE, name)) return;

    // 3. Revalidate in background (or foreground if no stale data)
    setIsRevalidating(true);
    revalidatePage(currentPage, PAGE_SIZE, name)
      .then((data) => {
        setPagedData(data);
        setLoading(false);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu'))
      .finally(() => setIsRevalidating(false));
  }, [currentPage, debouncedName, viewMode, refreshKey]);

  const triggerRefresh = useCallback(() => {
    invalidateMembersCache();
    setRefreshKey((k) => k + 1);
  }, []);

  const handleOpenLineage = useCallback(async (id: string, name: string) => {
    setLineageLoading(true);
    try {
      const all = await getCachedAllMembers();
      setLineageMembers(all);
      setLineageTarget({ id, name });
    } catch {
      setError('Không thể tải dữ liệu cây trực hệ');
    } finally {
      setLineageLoading(false);
    }
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMember(deleteTarget.id);
      setDeleteTarget(null);
      triggerRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const handleRecalculate = useCallback(async () => {
    if (recalculating) return;
    // Close any previous SSE connection
    esRef.current?.close();
    esRef.current = null;

    setRecalculating(true);
    setRecalcProgress(null);
    setRecalcDone(null);
    setError(null);

    let jobId: string;
    try {
      const res = await recalculateMemberStats();
      jobId = res.data.jobId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể bắt đầu tính lại');
      setRecalculating(false);
      return;
    }

    const es = subscribeRecalculateEvents(jobId, {
      onProgress: (data) => setRecalcProgress(data),
      onDone: (data) => {
        es.close();
        esRef.current = null;
        setRecalculating(false);
        setRecalcProgress(null);
        setRecalcDone(data);
        triggerRefresh();
        // Auto-clear the done toast after 5s
        setTimeout(() => setRecalcDone(null), 5000);
      },
      onError: (data) => {
        es.close();
        esRef.current = null;
        setRecalculating(false);
        setRecalcProgress(null);
        setError(data.message ?? 'Tính lại thất bại');
      },
    });
    esRef.current = es;
  }, [recalculating, triggerRefresh]);

  const members = pagedData?.items ?? [];
  const total = pagedData?.total ?? 0;
  const totalPages = pagedData?.totalPages ?? 1;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--t-accent)' }}
            >
              <svg className="w-5 h-5 text-amber-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-stone-900">Gia phả</h1>
          </div>
          <div className="flex items-center gap-3 pl-12 flex-wrap">
            {!loading && pagedData && (
              <span className="text-sm text-stone-500">
                <span className="font-semibold text-stone-700">{total}</span> thành viên
              </span>
            )}
            {isRevalidating && !loading && (
              <span className="flex items-center gap-1 text-xs text-stone-400">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang làm mới...
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:flex-shrink-0">
          <button
            onClick={handleRecalculate}
            disabled={recalculating || loading}
            className="flex min-w-0 items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-50 shadow-sm"
            title="Tính lại số liệu thống kê (đời, con cháu, anh chị em...)"
          >
            <svg className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {recalculating ? 'Đang tính...' : 'Tính lại số liệu'}
          </button>

          <Link
            href="/admin/gia-pha/new"
            className="flex min-w-0 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-amber-50 rounded-xl transition-all shadow-sm"
            style={{
              background: 'var(--t-accent)',
              boxShadow: '0 2px 12px color-mix(in oklch, var(--t-accent) 20%, transparent)',
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Thêm thành viên
          </Link>
        </div>
      </div>

      {/* ── Recalculate progress banner ── */}
      {recalculating && recalcProgress && (
        <RecalcProgressBanner progress={recalcProgress} />
      )}

      {/* ── Recalculate done toast ── */}
      {recalcDone && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm">
          <svg className="w-4 h-4 flex-shrink-0 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>
            Đã tính lại xong <span className="font-semibold">{recalcDone.updated}</span> thành viên
            {' '}trong <span className="font-semibold">{(recalcDone.durationMs / 1000).toFixed(1)}s</span>.
          </span>
          <button onClick={() => setRecalcDone(null)} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Filter & View Mode ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {viewMode !== 'tree' && (
            <div className="relative w-full sm:max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Tìm theo tên..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors shadow-sm"
              />
              {filterName && (
                <button onClick={() => setFilterName('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          {/* Force-reload button — bypasses cache, fetches fresh from API */}
          {viewMode !== 'tree' && (
            <button
              onClick={triggerRefresh}
              disabled={loading || isRevalidating}
              title="Tải lại từ máy chủ (bỏ qua cache)"
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 bg-white shadow-sm text-stone-500 hover:text-red-600 hover:border-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                className={`w-4 h-4 ${isRevalidating || loading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          {viewMode !== 'tree' && debouncedName && pagedData && (
            <span className="hidden text-xs text-stone-500 sm:inline">{total} kết quả</span>
          )}
        </div>

        <div className="grid w-full grid-cols-3 bg-white border border-stone-200 rounded-xl p-1 shadow-sm sm:flex sm:w-auto sm:items-center">
          <button
            onClick={() => setViewMode('table')}
            className={`justify-center px-2 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 sm:px-3 sm:py-1.5 ${viewMode === 'table' ? 'bg-stone-100 text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Danh sách
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`justify-center px-2 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 sm:px-3 sm:py-1.5 ${viewMode === 'grid' ? 'bg-stone-100 text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Lưới
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`justify-center px-2 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 sm:px-3 sm:py-1.5 ${viewMode === 'tree' ? 'bg-stone-100 text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Cây gia phả
          </button>
        </div>
      </div>

      {/* ── Table View ── */}
      {viewMode === 'table' && (
        <>
        <div className="hidden bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden sm:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--t-surface-2)', borderBottom: '1px solid var(--t-border)' }}>
                  <th className="px-5 py-3 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider" style={{ width: '35%' }}>Thành viên</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider" style={{ width: '80px' }}>Ngày sinh</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider" style={{ width: '80px' }}>Ngày mất</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden sm:table-cell">Giới tính</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden sm:table-cell" style={{ width: '70px' }}>Đời thứ</th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold text-stone-500 uppercase tracking-wider" style={{ width: '160px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-stone-100 flex-shrink-0" /><div className="h-4 w-36 bg-stone-100 rounded" /></div></td>
                      <td className="px-4 py-4"><div className="h-3 w-14 bg-stone-100 rounded" /></td>
                      <td className="px-4 py-4"><div className="h-3 w-14 bg-stone-100 rounded" /></td>
                      <td className="px-4 py-4 hidden sm:table-cell"><div className="h-4 w-10 bg-stone-100 rounded-full" /></td>
                      <td className="px-4 py-4 hidden sm:table-cell"><div className="h-3 w-8 bg-stone-100 rounded" /></td>
                      <td className="px-5 py-4"><div className="h-3 w-16 bg-stone-100 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-10 h-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-stone-400 text-sm">{debouncedName ? `Không tìm thấy "${debouncedName}"` : 'Chưa có thành viên nào'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-stone-50/60 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <AvatarCell member={member} />
                          <div>
                            <p className="font-semibold text-stone-900 group-hover:text-red-700 transition-colors">{member.fullName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><DateCell date={member.birthDate} year={member.birthYear} /></td>
                      <td className="px-4 py-3.5"><DateCell date={member.deathDate} year={member.deathYear} /></td>
                      <td className="px-4 py-3.5 hidden sm:table-cell"><GenderBadge gender={member.gender} /></td>
                      <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-stone-500 font-medium">
                        {member.generation ? `Đời ${member.generation}` : <span className="text-stone-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenLineage(member.id, member.fullName)}
                            disabled={lineageLoading}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            style={{ color: 'var(--t-warning)', background: 'color-mix(in oklch, var(--t-warning) 6%, transparent)' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in oklch, var(--t-warning) 12%, transparent)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in oklch, var(--t-warning) 6%, transparent)')}
                            title="Xem cây trực hệ"
                          >
                            {lineageLoading ? '...' : 'Cây trực hệ'}
                          </button>
                          <Link
                            href={`/admin/gia-pha/${member.id}`}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors"
                            style={{ color: 'var(--t-info)', background: 'color-mix(in oklch, var(--t-info) 6%, transparent)' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'color-mix(in oklch, var(--t-info) 12%, transparent)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'color-mix(in oklch, var(--t-info) 6%, transparent)')}
                          >
                            Sửa
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(member)}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors"
                            style={{ color: 'var(--t-error)', background: 'color-mix(in oklch, var(--t-error) 6%, transparent)' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in oklch, var(--t-error) 12%, transparent)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in oklch, var(--t-error) 6%, transparent)')}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-3 sm:hidden">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-stone-100" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-stone-100" />
                    <div className="h-3 w-24 rounded bg-stone-100" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="h-10 rounded-xl bg-stone-100" />
                  <div className="h-10 rounded-xl bg-stone-100" />
                </div>
              </div>
            ))
          ) : members.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-5 py-12 text-center shadow-sm">
              <svg className="mx-auto h-10 w-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="mt-3 text-sm text-stone-400">{debouncedName ? `Không tìm thấy "${debouncedName}"` : 'Chưa có thành viên nào'}</p>
            </div>
          ) : (
            members.map((member) => (
              <article key={member.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AvatarCell member={member} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-stone-900">{member.fullName}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <GenderBadge gender={member.gender} />
                      {member.generation ? (
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                          Đời {member.generation}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-stone-50 px-3 py-2">
                    <span className="block text-stone-400">Ngày sinh</span>
                    <span className="mt-0.5 block font-medium text-stone-700">
                      {member.birthDate ? formatDayMonth(member.birthDate) : member.birthYear ?? '—'}
                    </span>
                  </div>
                  <div className="rounded-xl bg-stone-50 px-3 py-2">
                    <span className="block text-stone-400">Ngày mất</span>
                    <span className="mt-0.5 block font-medium text-stone-700">
                      {member.deathDate ? formatDayMonth(member.deathDate) : member.deathYear ?? '—'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-stone-100 pt-3">
                  <button
                    onClick={() => handleOpenLineage(member.id, member.fullName)}
                    disabled={lineageLoading}
                    className="min-h-9 rounded-lg bg-amber-50 px-2 text-center text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
                    title="Xem cây trực hệ"
                  >
                    {lineageLoading ? '...' : 'Trực hệ'}
                  </button>
                  <Link
                    href={`/admin/gia-pha/${member.id}`}
                    className="flex min-h-9 items-center justify-center rounded-lg bg-blue-50 px-2 text-center text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(member)}
                    className="min-h-9 rounded-lg bg-red-50 px-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                  >
                    Xóa
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
        </>
      )}

      {/* ── Grid View ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex-shrink-0" />
                  <div className="space-y-2"><div className="h-4 w-24 bg-stone-100 rounded" /><div className="h-3 w-16 bg-stone-100 rounded" /></div>
                </div>
                <div className="space-y-2 mt-4"><div className="h-3 w-full bg-stone-100 rounded" /><div className="h-3 w-2/3 bg-stone-100 rounded" /></div>
              </div>
            ))
          ) : members.length === 0 ? (
            <div className="col-span-full py-16 text-center"><p className="text-stone-400 text-sm">Không tìm thấy thành viên nào</p></div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <AvatarCell member={member} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-900 truncate" title={member.fullName}>{member.fullName}</h3>
                    <div className="mt-1"><GenderBadge gender={member.gender} /></div>
                  </div>
                </div>
                <div className="text-xs text-stone-500 space-y-1 mb-4 flex-1">
                  <p><span className="text-stone-400">Ngày sinh:</span> {member.birthDate ? formatDayMonth(member.birthDate) : member.birthYear ?? '—'}</p>
                  <p><span className="text-stone-400">Ngày mất:</span> {member.deathDate ? formatDayMonth(member.deathDate) : member.deathYear ?? '—'}</p>
                  {member.generation ? (
                    <p><span className="text-stone-400">Đời thứ:</span> <span className="font-semibold text-stone-700">{member.generation}</span></p>
                  ) : null}
                </div>
                <div className="flex items-center gap-1.5 pt-3 border-t border-stone-100 mt-auto">
                  <button
                    onClick={() => handleOpenLineage(member.id, member.fullName)}
                    disabled={lineageLoading}
                    className="flex-1 text-center px-2 py-1.5 text-xs font-medium rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-50"
                    title="Xem cây trực hệ"
                  >
                    {lineageLoading ? '...' : 'Cây trực hệ'}
                  </button>
                  <Link href={`/admin/gia-pha/${member.id}`} className="flex-1 text-center px-2 py-1.5 text-xs font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                    Sửa
                  </Link>
                  <button onClick={() => setDeleteTarget(member)} className="px-2 py-1.5 text-xs font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors">
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tree View ── */}
      {viewMode === 'tree' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden h-[calc(100vh-240px)] min-h-[460px] flex flex-col sm:h-[calc(100vh-200px)] sm:min-h-[600px]">
          <div className="p-4 border-b border-stone-100 bg-stone-50">
            <h3 className="text-sm font-semibold text-stone-800">Sơ đồ cây gia phả</h3>
            <p className="text-xs text-stone-500">
              Nhấn vào thành viên để xem thông tin — có thể sửa thông tin trực tiếp từ đây.
            </p>
          </div>
          <div className="flex-1 relative">
            <FamilyTree
              refreshKey={refreshKey}
              onEditMember={(id) => setEditMemberId(id)}
              onDeleteMember={async (id) => { await deleteMember(id); triggerRefresh(); }}
            />
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {(viewMode === 'table' || viewMode === 'grid') && totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-stone-200 pt-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm text-stone-500 sm:text-left">
            Hiển thị <span className="font-medium">{(currentPage - 1) * PAGE_SIZE + 1}</span> đến{' '}
            <span className="font-medium">{Math.min(currentPage * PAGE_SIZE, total)}</span> trong số{' '}
            <span className="font-medium">{total}</span> kết quả
          </p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:flex">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Trước</button>
            <div className="px-4 py-2 text-sm font-medium text-stone-800 bg-stone-100 rounded-lg">{currentPage} / {totalPages}</div>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Sau</button>
          </div>
        </div>
      )}

      {editMemberId && (
        <EditMemberDrawer
          memberId={editMemberId}
          onClose={() => setEditMemberId(null)}
          onSaved={triggerRefresh}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa thành viên"
        message={`Bạn có chắc muốn xóa thành viên "${deleteTarget?.fullName}"? Hành động này không thể hoàn tác.`}
        confirmText={deleting ? 'Đang xóa...' : 'Xóa'}
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {lineageTarget && lineageMembers.length > 0 && (
        <LineageModal
          memberId={lineageTarget.id}
          memberName={lineageTarget.name}
          allMembers={lineageMembers}
          onClose={() => setLineageTarget(null)}
          onEditMember={(id) => setEditMemberId(id)}
          onDeleteMember={async (id) => { await deleteMember(id); triggerRefresh(); setLineageTarget(null); }}
        />
      )}
    </div>
  );
}
