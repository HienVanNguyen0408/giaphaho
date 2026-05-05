'use client';

import { useEffect, useState } from 'react';
import { getActivityLogs } from '@/lib/api';
import DataTable, { Column } from '@/components/shared/DataTable';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import type { ActivityLog } from '@/types';

export default function ActivityLogPage() {
  const { user } = useAdminAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = (p: number) => {
    setLoading(true);
    getActivityLogs(p, 20)
      .then((res) => {
        setLogs(res.data.items);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const columns: Column<ActivityLog>[] = [
    {
      key: 'user',
      header: 'Người dùng',
      render: (row) => (
        <div>
          <p className="font-medium text-stone-900 text-sm">{row.user?.username ?? row.userId}</p>
          <p className="text-xs text-stone-400">{row.user?.role}</p>
        </div>
      ),
      width: '150px',
    },
    {
      key: 'action',
      header: 'Hành động',
      width: '120px',
      render: (row) => (
        <span className="px-2 py-0.5 bg-stone-100 text-stone-700 text-xs font-medium rounded-full">
          {row.action}
        </span>
      ),
    },
    {
      key: 'target',
      header: 'Đối tượng',
      width: '130px',
      render: (row) => (
        <span className="text-stone-600 text-sm">{row.target}</span>
      ),
    },
    {
      key: 'detail',
      header: 'Chi tiết',
      render: (row) => (
        <span className="text-stone-500 text-sm truncate max-w-xs block">
          {row.detail ?? <span className="text-stone-300">—</span>}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Thời gian',
      width: '160px',
      render: (row) => (
        <span className="text-stone-400 text-xs whitespace-nowrap">
          {new Date(row.createdAt).toLocaleString('vi-VN')}
        </span>
      ),
    },
  ];

  if (user && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-stone-800 mb-2">Không có quyền truy cập</h1>
        <p className="text-stone-500 text-sm">
          Trang này chỉ dành cho Quản trị viên cao cấp (SUPER_ADMIN).
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Nhật ký hoạt động</h1>
        <p className="text-stone-500 text-sm mt-0.5">{total} bản ghi</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <DataTable
        data={logs}
        columns={columns}
        loading={loading}
        emptyMessage="Chưa có nhật ký nào"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-500">
            Trang {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-40"
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors disabled:opacity-40"
            >
              Tiếp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
