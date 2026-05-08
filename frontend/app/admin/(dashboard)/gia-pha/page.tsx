'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { deleteMember, exportMembers, importMembers, recalculateMemberStats, subscribeRecalculateEvents } from '@/lib/api';
import { AdminActionButton, AdminActionLink } from '@/components/admin/ui/AdminActionButton';
import AdminPageHeader, { AdminMetaChip } from '@/components/admin/ui/AdminPageHeader';
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
import SiblingReorderModal from '@/components/admin/gia-pha/SiblingReorderModal';
import type { Member, PaginatedResponse } from '@/types';

function compareSiblings(a: Member, b: Member): number {
  const aOrder = a.siblingOrder ?? Infinity;
  const bOrder = b.siblingOrder ?? Infinity;
  if (aOrder !== bOrder) return aOrder - bOrder;
  const aBirth = a.birthYear ?? Infinity;
  const bBirth = b.birthYear ?? Infinity;
  if (aBirth !== bBirth) return aBirth - bBirth;
  return a.fullName.localeCompare(b.fullName, 'vi');
}

function AvatarCell({ member }: { member: Member }) {
  if (member.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.avatar}
        alt={member.fullName}
        className="h-10 w-10 rounded-xl object-cover flex-shrink-0"
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
      className="h-10 w-10 rounded-xl flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
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
  return <span className="text-stone-700 text-xs font-medium tabular-nums">{val}</span>;
}

function GenderBadge({ gender }: { gender: string | null }) {
  if (!gender) return <span className="text-stone-300">—</span>;
  return (
    <span
      className="inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold"
      style={
        gender === 'Nam'
          ? { background: 'color-mix(in oklch, var(--t-info) 12%, white)', color: '#1d4ed8' }
          : { background: '#fdf2f8', color: '#be185d' }
      }
    >
      {gender}
    </span>
  );
}

type IconProps = { className?: string };

function TreeIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4m0 0a3 3 0 100 6 3 3 0 000-6zm0 6v3m-4 3h8M8 19a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );
}

function EditIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125 16.875 4.5M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

function SortIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M7 12h10M11 17h2" />
    </svg>
  );
}

function TrashIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21H8.084a2.25 2.25 0 0 1-2.244-1.827L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function GenerationBadge({ generation }: { generation: number | null }) {
  if (!generation) return <span className="text-xs text-stone-300">Chưa rõ đời</span>;
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-red-50 px-2.5 text-[11px] font-semibold text-red-800 ring-1 ring-inset ring-red-100">
      Đời {generation}
    </span>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | null;
  tone: 'red' | 'amber' | 'emerald' | 'blue';
}) {
  const toneClass = {
    red: 'bg-red-50 text-red-800 ring-red-100',
    amber: 'bg-amber-50 text-amber-800 ring-amber-100',
    emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
    blue: 'bg-blue-50 text-blue-800 ring-blue-100',
  }[tone];

  return (
    <span className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold ring-1 ring-inset ${toneClass}`}>
      <span className="tabular-nums">{value ?? 0}</span>
      <span>{label}</span>
    </span>
  );
}

function FamilyStats({ member }: { member: Member }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <StatChip label="con" value={(member.sonsCount ?? 0) + (member.daughtersCount ?? 0)} tone="red" />
      <StatChip label="cháu" value={member.descendantsCount} tone="amber" />
      <StatChip label="anh em" value={member.siblingsCount} tone="emerald" />
    </div>
  );
}

function LifeSummary({ member }: { member: Member }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-stone-400">Sinh</span>
      <DateCell date={member.birthDate} year={member.birthYear} />
      <span className="h-1 w-1 rounded-full bg-stone-300" />
      <span className="text-stone-400">Mất</span>
      <DateCell date={member.deathDate} year={member.deathYear} />
    </div>
  );
}

function ContactSummary({ member }: { member: Member }) {
  const primary = member.phone || member.email || member.residence;
  if (!primary) return <span className="text-xs text-stone-300">Chưa cập nhật liên hệ</span>;
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
      {member.phone && <span className="font-medium text-stone-700">{member.phone}</span>}
      {member.email && <span className="truncate">{member.email}</span>}
      {member.residence && <span className="truncate">{member.residence}</span>}
    </div>
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

function ImportModal({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<{ members: unknown[]; exportedAt?: string } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; updated: number; total: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setParseError(null);
    setParsed(null);
    setResult(null);
    setImportError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setParsed({ members: json });
        } else if (Array.isArray(json.members)) {
          setParsed({ members: json.members, exportedAt: json.exportedAt as string | undefined });
        } else {
          setParseError('File không đúng định dạng. Cần file JSON xuất từ hệ thống.');
        }
      } catch {
        setParseError('File JSON không hợp lệ');
      }
    };
    reader.onerror = () => setParseError('Không thể đọc file');
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!parsed) return;
    setImporting(true);
    setImportError(null);
    try {
      const res = await importMembers({ members: parsed.members, mode });
      setResult(res.data);
      onImported();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Nhập thất bại');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--t-text)' }}>Nhập dữ liệu gia phả</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--t-text-3)' }}>Chọn file JSON đã xuất từ hệ thống</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100 transition-colors" style={{ color: 'var(--t-text-2)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!result && (
          <label
            className="flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors"
            style={{ borderColor: file ? 'var(--t-accent)' : 'var(--t-border)', background: file ? 'color-mix(in oklch, var(--t-accent) 5%, transparent)' : 'transparent' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            <input
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <svg className="w-8 h-8" style={{ color: file ? 'var(--t-accent)' : 'var(--t-text-3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {file ? (
              <span className="text-sm font-medium" style={{ color: 'var(--t-accent)' }}>{file.name}</span>
            ) : (
              <span className="text-sm" style={{ color: 'var(--t-text-3)' }}>Kéo thả hoặc click để chọn file .json</span>
            )}
          </label>
        )}

        {parseError && (
          <div className="text-sm rounded-xl px-3 py-2" style={{ color: 'var(--t-error)', background: 'color-mix(in oklch, var(--t-error) 8%, white)' }}>
            {parseError}
          </div>
        )}

        {parsed && !result && (
          <div className="space-y-4">
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'color-mix(in oklch, var(--t-info) 8%, white)', border: '1px solid color-mix(in oklch, var(--t-info) 25%, transparent)' }}>
              <div className="font-semibold" style={{ color: 'var(--t-info)' }}>
                {parsed.members.length} thành viên trong file
              </div>
              {parsed.exportedAt && (
                <div className="text-xs mt-0.5" style={{ color: 'var(--t-text-2)' }}>
                  Xuất ngày: {new Date(parsed.exportedAt).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--t-text-3)' }}>Chế độ nhập</p>
              {([
                { id: 'merge', label: 'Gộp (Merge)', desc: 'Cập nhật thành viên có sẵn, thêm mới nếu chưa có. Khuyên dùng.' },
                { id: 'replace', label: 'Thay thế (Replace)', desc: 'Xóa toàn bộ dữ liệu hiện tại rồi nhập lại từ file. Không thể hoàn tác!' },
              ] as const).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className="w-full text-left px-4 py-3 rounded-xl border-2 transition-colors"
                  style={{
                    borderColor: mode === m.id ? (m.id === 'replace' ? 'var(--t-error)' : 'var(--t-info)') : 'var(--t-border)',
                    background: mode === m.id ? (m.id === 'replace' ? 'color-mix(in oklch, var(--t-error) 6%, white)' : 'color-mix(in oklch, var(--t-info) 6%, white)') : 'white',
                  }}
                >
                  <div className="text-sm font-semibold" style={{ color: mode === m.id && m.id === 'replace' ? 'var(--t-error)' : 'var(--t-text)' }}>{m.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--t-text-3)' }}>{m.desc}</div>
                </button>
              ))}
            </div>

            {mode === 'replace' && (
              <div className="text-sm rounded-xl px-4 py-3" style={{ color: 'var(--t-error)', background: 'color-mix(in oklch, var(--t-error) 8%, white)', border: '1px solid color-mix(in oklch, var(--t-error) 25%, transparent)' }}>
                Cảnh báo: Toàn bộ dữ liệu gia phả hiện tại sẽ bị xóa và không thể khôi phục!
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="rounded-xl px-4 py-4 space-y-1" style={{ background: 'color-mix(in oklch, var(--t-success) 8%, white)', border: '1px solid color-mix(in oklch, var(--t-success) 25%, transparent)' }}>
            <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--t-success)' }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Nhập thành công
            </div>
            <div className="text-sm" style={{ color: 'var(--t-text-2)' }}>
              {result.created} thêm mới · {result.updated} cập nhật · Tổng {result.total} thành viên
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--t-text-3)' }}>
              Chạy &ldquo;Tính lại số liệu&rdquo; để cập nhật thống kê (đời, con cháu...).
            </div>
          </div>
        )}

        {importError && (
          <div className="text-sm rounded-xl px-3 py-2" style={{ color: 'var(--t-error)', background: 'color-mix(in oklch, var(--t-error) 8%, white)' }}>
            {importError}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          {result ? (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-opacity"
              style={{ background: 'var(--t-accent)' }}
            >
              Đóng
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors"
                style={{ background: 'var(--t-surface-2)', color: 'var(--t-text)' }}
              >
                Hủy
              </button>
              <button
                onClick={handleImport}
                disabled={!parsed || importing}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-opacity disabled:opacity-50"
                style={{ background: mode === 'replace' ? 'var(--t-error)' : 'var(--t-accent)' }}
              >
                {importing ? 'Đang nhập...' : 'Nhập dữ liệu'}
              </button>
            </>
          )}
        </div>
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
  const [reorderTarget, setReorderTarget] = useState<{ anchor: Member; siblings: Member[] } | null>(null);
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

  const handleOpenReorder = useCallback(async (member: Member) => {
    if (!member.parentId) return;
    const all = await getCachedAllMembers();
    const siblings = all
      .filter((m) => m.parentId === member.parentId)
      .sort(compareSiblings);
    setReorderTarget({ anchor: member, siblings });
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
    <div className="w-full space-y-5">
      <AdminPageHeader
        title="Gia phả"
        eyebrow="Quản trị thành viên"
        description="Quản lý hồ sơ thành viên, quan hệ gia đình và sơ đồ cây gia phả."
        meta={
          <>
            {!loading && pagedData && <AdminMetaChip label="Tổng" value={`${total} thành viên`} tone="blue" />}
            {isRevalidating && !loading && <AdminMetaChip label="Trạng thái" value="Đang làm mới" tone="amber" />}
          </>
        }
        actions={
          <>
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
          </>
        }
      />

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
        <div className="hidden w-full overflow-hidden rounded-2xl border border-stone-200 bg-white sm:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80">
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-stone-500" style={{ width: '34%' }}>Thành viên</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-stone-500" style={{ width: '180px' }}>Đời / sinh mất</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-stone-500">Gia đình</th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-stone-500" style={{ width: '148px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-10 w-10 flex-shrink-0 rounded-xl bg-stone-100" /><div className="space-y-2"><div className="h-4 w-36 rounded bg-stone-100" /><div className="h-3 w-48 rounded bg-stone-100" /></div></div></td>
                      <td className="px-4 py-4"><div className="h-6 w-20 rounded-full bg-stone-100" /></td>
                      <td className="px-4 py-4"><div className="h-7 w-64 rounded-full bg-stone-100" /></td>
                      <td className="px-5 py-4"><div className="h-3 w-16 bg-stone-100 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center">
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
                    <tr key={member.id} className="transition-colors hover:bg-red-50/20">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <AvatarCell member={member} />
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-semibold text-stone-950 transition-colors">{member.fullName}</p>
                            <div className="mt-1 max-w-xl">
                              <ContactSummary member={member} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <GenerationBadge generation={member.generation} />
                            <GenderBadge gender={member.gender} />
                          </div>
                          <LifeSummary member={member} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <FamilyStats member={member} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5 overflow-visible">
                          <AdminActionButton
                            label="Xem cây trực hệ"
                            tone="amber"
                            onClick={() => handleOpenLineage(member.id, member.fullName)}
                            disabled={lineageLoading}
                          >
                            {lineageLoading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-300 border-t-amber-700" /> : <TreeIcon />}
                          </AdminActionButton>
                          {(member.siblingsCount ?? 0) > 0 && (
                            <AdminActionButton
                              label="Sắp xếp thứ tự anh chị em"
                              tone="green"
                              onClick={() => handleOpenReorder(member)}
                            >
                              <SortIcon />
                            </AdminActionButton>
                          )}
                          <AdminActionLink
                            href={`/admin/gia-pha/${member.id}`}
                            label="Sửa thành viên"
                            tone="blue"
                          >
                            <EditIcon />
                          </AdminActionLink>
                          <AdminActionButton label="Xóa thành viên" tone="red" onClick={() => setDeleteTarget(member)}>
                            <TrashIcon />
                          </AdminActionButton>
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

                <div className="mt-4 space-y-2 rounded-xl bg-stone-50 px-3 py-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <GenerationBadge generation={member.generation} />
                    <GenderBadge gender={member.gender} />
                  </div>
                  <LifeSummary member={member} />
                </div>
                <div className="mt-2 rounded-xl bg-white">
                  <FamilyStats member={member} />
                </div>
                {(member.phone || member.email || member.residence) && (
                  <div className="mt-2 rounded-xl bg-stone-50 px-3 py-2">
                    <ContactSummary member={member} />
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-2 border-t border-stone-100 pt-3">
                  <AdminActionButton
                    label="Xem cây trực hệ"
                    tone="amber"
                    onClick={() => handleOpenLineage(member.id, member.fullName)}
                    disabled={lineageLoading}
                  >
                    {lineageLoading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-300 border-t-amber-700" /> : <TreeIcon className="h-3.5 w-3.5" />}
                  </AdminActionButton>
                  {(member.siblingsCount ?? 0) > 0 && (
                    <AdminActionButton
                      label="Sắp xếp thứ tự anh chị em"
                      tone="green"
                      onClick={() => handleOpenReorder(member)}
                    >
                      <SortIcon className="h-3.5 w-3.5" />
                    </AdminActionButton>
                  )}
                  <AdminActionLink
                    href={`/admin/gia-pha/${member.id}`}
                    label="Sửa thành viên"
                    tone="blue"
                  >
                    <EditIcon className="h-3.5 w-3.5" />
                  </AdminActionLink>
                  <AdminActionButton label="Xóa thành viên" tone="red" onClick={() => setDeleteTarget(member)}>
                    <TrashIcon className="h-3.5 w-3.5" />
                  </AdminActionButton>
                </div>
              </article>
            ))
          )}
        </div>
        </>
      )}

      {/* ── Grid View ── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
              <article key={member.id} className="flex min-h-[260px] flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-colors hover:border-red-200">
                <div className="flex items-start gap-3 mb-3">
                  <AvatarCell member={member} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-900 truncate" title={member.fullName}>{member.fullName}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <GenerationBadge generation={member.generation} />
                      <GenderBadge gender={member.gender} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-stone-50 px-3 py-2">
                  <LifeSummary member={member} />
                </div>

                <div className="mt-2">
                  <FamilyStats member={member} />
                </div>

                <div className="mt-2 min-h-12 rounded-xl bg-stone-50 px-3 py-2">
                  <ContactSummary member={member} />
                </div>

                <div className="mt-auto flex items-center justify-end gap-2 border-t border-stone-100 pt-3">
                  <AdminActionButton
                    label="Xem cây trực hệ"
                    tone="amber"
                    onClick={() => handleOpenLineage(member.id, member.fullName)}
                    disabled={lineageLoading}
                  >
                    {lineageLoading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-300 border-t-amber-700" /> : <TreeIcon />}
                  </AdminActionButton>
                  {(member.siblingsCount ?? 0) > 0 && (
                    <AdminActionButton
                      label="Sắp xếp thứ tự anh chị em"
                      tone="green"
                      onClick={() => handleOpenReorder(member)}
                    >
                      <SortIcon />
                    </AdminActionButton>
                  )}
                  <AdminActionLink
                    href={`/admin/gia-pha/${member.id}`}
                    label="Sửa thành viên"
                    tone="blue"
                  >
                    <EditIcon />
                  </AdminActionLink>
                  <AdminActionButton label="Xóa thành viên" tone="red" onClick={() => setDeleteTarget(member)}>
                    <TrashIcon />
                  </AdminActionButton>
                </div>
              </article>
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
              onReorderSiblings={handleOpenReorder}
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

      {reorderTarget && (
        <SiblingReorderModal
          anchor={reorderTarget.anchor}
          siblings={reorderTarget.siblings}
          onClose={() => setReorderTarget(null)}
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
          onReorderSiblings={handleOpenReorder}
        />
      )}
    </div>
  );
}
