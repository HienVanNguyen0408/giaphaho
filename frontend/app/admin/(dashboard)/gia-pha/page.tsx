'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getMembers, deleteMember, recalculateMemberStats } from '@/lib/api';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import FamilyTree from '@/components/public/gia-pha/FamilyTree';
import LineageModal from '@/components/public/gia-pha/LineageModal';
import type { Member } from '@/types';

function AvatarCell({ member }: { member: Member }) {
  if (member.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.avatar}
        alt={member.fullName}
        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
        style={{ border: '1px solid rgba(0,0,0,0.08)' }}
      />
    );
  }
  const initials = member.fullName
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const colors = ['#8b1a1a', '#b45309', '#1d4ed8', '#065f46', '#6d28d9'];
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

function GenderBadge({ gender }: { gender: string | null }) {
  if (!gender) return <span className="text-stone-300">—</span>;
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={
        gender === 'Nam'
          ? { background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }
          : { background: 'rgba(236,72,153,0.1)', color: '#ec4899' }
      }
    >
      {gender}
    </span>
  );
}

export default function GiaPhaAdminPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'tree'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [lineageTarget, setLineageTarget] = useState<{ id: string; name: string } | null>(null);
  const [recalculating, setRecalculating] = useState(false);
  const pageSize = 12;

  const fetchMembers = () => {
    setLoading(true);
    getMembers()
      .then((res) => setMembers(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filtered = useMemo(() => {
    if (!filterName.trim()) return members;
    const q = filterName.toLowerCase();
    return members.filter((m) => m.fullName.toLowerCase().includes(q));
  }, [members, filterName]);

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterName, viewMode]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMember(deleteTarget.id);
      setDeleteTarget(null);
      fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    setError(null);
    try {
      await recalculateMemberStats();
      fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tính lại thất bại');
    } finally {
      setRecalculating(false);
    }
  };

  const alive = members.filter((m) => !m.deathYear).length;
  const deceased = members.filter((m) => m.deathYear).length;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(145deg, #8b1a1a, #b45309)' }}
            >
              <svg className="w-5 h-5 text-amber-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-stone-900">Gia phả</h1>
          </div>
          <div className="flex items-center gap-3 pl-12 flex-wrap">
            <span className="text-sm text-stone-500">
              <span className="font-semibold text-stone-700">{members.length}</span> thành viên
            </span>
            {!loading && members.length > 0 && (
              <>
                <span className="text-stone-300 text-xs">·</span>
                <span className="text-xs text-emerald-600 font-medium">{alive} đang sống</span>
                {deceased > 0 && (
                  <>
                    <span className="text-stone-300 text-xs">·</span>
                    <span className="text-xs text-stone-400">{deceased} đã mất</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleRecalculate}
            disabled={recalculating || loading}
            className="flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-50 shadow-sm"
            title="Tính lại số liệu thống kê (đời, con cháu, anh chị em...)"
          >
            <svg className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {recalculating ? 'Đang tính...' : 'Tính lại số liệu'}
          </button>

          <Link
            href="/admin/gia-pha/new"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-amber-50 rounded-xl transition-all shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #8b1a1a, #b45309)',
              boxShadow: '0 2px 12px rgba(139,26,26,0.2)',
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Thêm thành viên
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Filter & View Mode ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative max-w-xs w-full">
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
          {filterName && <span className="text-xs text-stone-500">{filtered.length} kết quả</span>}
        </div>

        <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-stone-100 text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Danh sách
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-stone-100 text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Lưới
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${viewMode === 'tree' ? 'bg-stone-100 text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'}`}
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
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#faf7f3', borderBottom: '1px solid #e8e0d4' }}>
                  <th className="px-5 py-3 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider" style={{ width: '35%' }}>Thành viên</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider" style={{ width: '70px' }}>Năm sinh</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider" style={{ width: '70px' }}>Năm mất</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden md:table-cell">Giới tính</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden lg:table-cell" style={{ width: '70px' }}>Đời thứ</th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold text-stone-500 uppercase tracking-wider" style={{ width: '160px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-stone-100 flex-shrink-0" /><div className="h-4 w-36 bg-stone-100 rounded" /></div></td>
                      <td className="px-4 py-4"><div className="h-3 w-12 bg-stone-100 rounded" /></td>
                      <td className="px-4 py-4"><div className="h-3 w-12 bg-stone-100 rounded" /></td>
                      <td className="px-4 py-4 hidden md:table-cell"><div className="h-4 w-10 bg-stone-100 rounded-full" /></td>
                      <td className="px-4 py-4 hidden lg:table-cell"><div className="h-3 w-8 bg-stone-100 rounded" /></td>
                      <td className="px-5 py-4"><div className="h-3 w-16 bg-stone-100 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : paginatedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-10 h-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-stone-400 text-sm">{filterName ? `Không tìm thấy "${filterName}"` : 'Chưa có thành viên nào'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-stone-50/60 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <AvatarCell member={member} />
                          <div>
                            <p className="font-semibold text-stone-900 group-hover:text-red-700 transition-colors">{member.fullName}</p>
                            {member.parentId && (
                              <p className="text-[11px] text-stone-400 mt-0.5">
                                {members.find(m => m.id === member.parentId)?.fullName
                                  ? `Con của: ${members.find(m => m.id === member.parentId)?.fullName}`
                                  : `Con của ID: ${member.parentId.slice(0, 8)}…`}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-stone-600">{member.birthYear ?? <span className="text-stone-300">—</span>}</td>
                      <td className="px-4 py-3.5 text-stone-600">{member.deathYear ?? <span className="text-stone-300">—</span>}</td>
                      <td className="px-4 py-3.5 hidden md:table-cell"><GenderBadge gender={member.gender} /></td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-stone-500 font-medium">
                        {member.generation ? `Đời ${member.generation}` : <span className="text-stone-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setLineageTarget({ id: member.id, name: member.fullName })}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors"
                            style={{ color: '#92400e', background: 'rgba(180,83,9,0.06)' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(180,83,9,0.12)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(180,83,9,0.06)')}
                            title="Xem cây trực hệ"
                          >
                            Cây trực hệ
                          </button>
                          <Link
                            href={`/admin/gia-pha/${member.id}`}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors"
                            style={{ color: '#2563eb', background: 'rgba(37,99,235,0.06)' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(37,99,235,0.12)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(37,99,235,0.06)')}
                          >
                            Sửa
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(member)}
                            className="px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors"
                            style={{ color: '#dc2626', background: 'rgba(220,38,38,0.06)' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.12)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.06)')}
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
          ) : paginatedMembers.length === 0 ? (
            <div className="col-span-full py-16 text-center"><p className="text-stone-400 text-sm">Không tìm thấy thành viên nào</p></div>
          ) : (
            paginatedMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <AvatarCell member={member} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-stone-900 truncate" title={member.fullName}>{member.fullName}</h3>
                    <div className="mt-1"><GenderBadge gender={member.gender} /></div>
                  </div>
                </div>
                <div className="text-xs text-stone-500 space-y-1 mb-4 flex-1">
                  <p><span className="text-stone-400">Năm sinh:</span> {member.birthYear ?? '—'}</p>
                  <p><span className="text-stone-400">Năm mất:</span> {member.deathYear ?? '—'}</p>
                  {member.generation && <p><span className="text-stone-400">Đời thứ:</span> {member.generation}</p>}
                </div>
                <div className="flex items-center gap-1.5 pt-3 border-t border-stone-100 mt-auto">
                  <button
                    onClick={() => setLineageTarget({ id: member.id, name: member.fullName })}
                    className="flex-1 text-center px-2 py-1.5 text-xs font-medium rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                    title="Xem cây trực hệ"
                  >
                    Cây trực hệ
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
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden h-[calc(100vh-200px)] min-h-[600px] flex flex-col">
          <div className="p-4 border-b border-stone-100 bg-stone-50">
            <h3 className="text-sm font-semibold text-stone-800">Sơ đồ cây gia phả</h3>
            <p className="text-xs text-stone-500">
              Nhấn vào thành viên để xem thông tin và cây trực hệ. Chỉ xem — chỉnh sửa dùng chế độ Danh sách.
            </p>
          </div>
          <div className="flex-1 relative">
            <FamilyTree />
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {(viewMode === 'table' || viewMode === 'grid') && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-stone-200 pt-4 mt-4">
          <p className="text-sm text-stone-500">
            Hiển thị <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> đến <span className="font-medium">{Math.min(currentPage * pageSize, filtered.length)}</span> trong số <span className="font-medium">{filtered.length}</span> kết quả
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Trước</button>
            <div className="px-4 py-1.5 text-sm font-medium text-stone-800 bg-stone-100 rounded-lg">{currentPage} / {totalPages}</div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Sau</button>
          </div>
        </div>
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

      {lineageTarget && (
        <LineageModal
          memberId={lineageTarget.id}
          memberName={lineageTarget.name}
          allMembers={members}
          onClose={() => setLineageTarget(null)}
        />
      )}
    </div>
  );
}
