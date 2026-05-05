'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getMembers, deleteMember } from '@/lib/api';
import DataTable, { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { Member } from '@/types';

export default function GiaPhaAdminPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const columns: Column<Member>[] = [
    {
      key: 'fullName',
      header: 'Họ tên',
      render: (row) => (
        <span className="font-medium text-stone-900">{row.fullName}</span>
      ),
    },
    {
      key: 'birthYear',
      header: 'Năm sinh',
      render: (row) => row.birthYear ?? <span className="text-stone-400">—</span>,
      width: '100px',
    },
    {
      key: 'deathYear',
      header: 'Năm mất',
      render: (row) => row.deathYear ?? <span className="text-stone-400">—</span>,
      width: '100px',
    },
    {
      key: 'chiId',
      header: 'Chi họ',
      render: (row) => row.chiId ?? <span className="text-stone-400">—</span>,
      width: '120px',
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '140px',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/gia-pha/${row.id}`}
            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            Sửa
          </Link>
          <button
            onClick={() => setDeleteTarget(row)}
            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Gia phả</h1>
          <p className="text-stone-500 text-sm mt-0.5">{members.length} thành viên</p>
        </div>
        <Link
          href="/admin/gia-pha/new"
          className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-amber-600 rounded-xl hover:from-red-800 hover:to-amber-700 transition-all shadow-sm"
        >
          + Thêm thành viên
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="max-w-xs">
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder="Lọc theo tên..."
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
        />
      </div>

      {/* Table */}
      <DataTable
        data={filtered}
        columns={columns}
        loading={loading}
        emptyMessage="Không tìm thấy thành viên nào"
      />

      {/* Confirm delete dialog */}
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
    </div>
  );
}
