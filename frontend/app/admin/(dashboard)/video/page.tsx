'use client';

import { useEffect, useState, FormEvent } from 'react';
import { getVideos, createVideo, deleteVideo, reorderVideos } from '@/lib/api';
import DataTable, { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { Video } from '@/types';

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname === 'youtu.be') return u.pathname.slice(1);
  } catch {
    // ignore
  }
  return null;
}

export default function VideoAdminPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addUrl, setAddUrl] = useState('');
  const [adding, setAdding] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVideos = () => {
    setLoading(true);
    getVideos()
      .then((res) => setVideos(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!addTitle.trim() || !addUrl.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const ytId = extractYouTubeId(addUrl.trim());
      const thumbnailUrl = ytId
        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
        : undefined;
      await createVideo({ title: addTitle.trim(), youtubeUrl: addUrl.trim(), thumbnailUrl });
      setAddTitle('');
      setAddUrl('');
      setShowAdd(false);
      fetchVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thêm video thất bại');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVideo(deleteTarget.id);
      setDeleteTarget(null);
      fetchVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const handleMove = async (idx: number, direction: 'up' | 'down') => {
    const newVideos = [...videos];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newVideos.length) return;
    [newVideos[idx], newVideos[targetIdx]] = [newVideos[targetIdx], newVideos[idx]];
    setVideos(newVideos);
    try {
      await reorderVideos(newVideos.map((v) => v.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sắp xếp thất bại');
      fetchVideos(); // revert
    }
  };

  const columns: Column<Video>[] = [
    {
      key: 'title',
      header: 'Tiêu đề',
      render: (row) => <span className="font-medium text-stone-900">{row.title}</span>,
    },
    {
      key: 'youtubeUrl',
      header: 'YouTube URL',
      render: (row) => (
        <a
          href={row.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-xs truncate max-w-[200px] block"
        >
          {row.youtubeUrl}
        </a>
      ),
    },
    {
      key: 'order',
      header: 'Thứ tự',
      width: '80px',
      render: (row) => (
        <span className="text-stone-500 text-sm">{row.order}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '180px',
      render: (row) => {
        const idx = videos.findIndex((v) => v.id === row.id);
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMove(idx, 'up')}
              disabled={idx === 0}
              className="px-2 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors disabled:opacity-30"
              aria-label="Lên"
            >
              ↑
            </button>
            <button
              onClick={() => handleMove(idx, 'down')}
              disabled={idx === videos.length - 1}
              className="px-2 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors disabled:opacity-30"
              aria-label="Xuống"
            >
              ↓
            </button>
            <button
              onClick={() => setDeleteTarget(row)}
              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              Xóa
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Video</h1>
          <p className="text-stone-500 text-sm mt-0.5">{videos.length} video</p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-amber-600 rounded-xl hover:from-red-800 hover:to-amber-700 transition-all shadow-sm"
        >
          {showAdd ? 'Hủy' : '+ Thêm video'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Inline add form */}
      {showAdd && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-stone-800 mb-4">Thêm video mới</h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              placeholder="Tiêu đề video"
              required
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
            />
            <input
              type="url"
              value={addUrl}
              onChange={(e) => setAddUrl(e.target.value)}
              placeholder="URL YouTube (https://youtube.com/watch?v=...)"
              required
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
            />
            <button
              type="submit"
              disabled={adding}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-stone-800 hover:bg-stone-900 rounded-xl transition-colors disabled:opacity-60"
            >
              {adding ? 'Đang thêm...' : 'Thêm'}
            </button>
          </form>
          {addUrl && extractYouTubeId(addUrl) && (
            <p className="text-xs text-stone-400 mt-2">
              ID YouTube: <span className="font-mono text-stone-600">{extractYouTubeId(addUrl)}</span>{' '}
              — ảnh thumbnail sẽ được tự động lấy.
            </p>
          )}
        </div>
      )}

      <DataTable
        data={videos}
        columns={columns}
        loading={loading}
        emptyMessage="Chưa có video nào"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa video"
        message={`Bạn có chắc muốn xóa video "${deleteTarget?.title}"?`}
        confirmText={deleting ? 'Đang xóa...' : 'Xóa'}
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
