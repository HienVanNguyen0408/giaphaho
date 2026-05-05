'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNewsList, deleteNews, togglePin } from '@/lib/api';
import DataTable, { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { NewsListItem } from '@/types';

export default function TinTucAdminPage() {
  const [items, setItems] = useState<NewsListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchNews = () => {
    setLoading(true);
    getNewsList(1, 100)
      .then((res) => setItems(res.data.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteNews(deleteTarget.id);
      setDeleteTarget(null);
      fetchNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePin = async (item: NewsListItem) => {
    setTogglingId(item.id);
    try {
      await togglePin(item.id);
      fetchNews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setTogglingId(null);
    }
  };

  const columns: Column<NewsListItem>[] = [
    {
      key: 'title',
      header: 'Tiêu đề',
      render: (row) => (
        <span className="font-medium text-stone-900 line-clamp-2">{row.title}</span>
      ),
    },
    {
      key: 'publishedAt',
      header: 'Ngày đăng',
      width: '140px',
      render: (row) => (
        <span className="text-stone-500 text-xs">
          {new Date(row.publishedAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'isPinned',
      header: 'Ghim',
      width: '80px',
      render: (row) =>
        row.isPinned ? (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            Ghim
          </span>
        ) : (
          <span className="text-stone-300 text-xs">—</span>
        ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '180px',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/tin-tuc/${row.id}`}
            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            Sửa
          </Link>
          <button
            onClick={() => handleTogglePin(row)}
            disabled={togglingId === row.id}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
              row.isPinned
                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                : 'text-stone-600 bg-stone-100 hover:bg-stone-200'
            }`}
          >
            {row.isPinned ? 'Bỏ ghim' : 'Ghim'}
          </button>
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
          <h1 className="text-2xl font-bold text-stone-900">Tin tức</h1>
          <p className="text-stone-500 text-sm mt-0.5">{items.length} bài viết</p>
        </div>
        <Link
          href="/admin/tin-tuc/new"
          className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-amber-600 rounded-xl hover:from-red-800 hover:to-amber-700 transition-all shadow-sm"
        >
          + Thêm bài viết
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        emptyMessage="Chưa có bài viết nào"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa bài viết"
        message={`Bạn có chắc muốn xóa bài viết "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
        confirmText={deleting ? 'Đang xóa...' : 'Xóa'}
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
