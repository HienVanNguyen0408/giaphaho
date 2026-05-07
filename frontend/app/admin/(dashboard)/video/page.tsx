'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { getVideos, createVideo, deleteVideo, reorderVideos } from '@/lib/api';
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

  // Drag state
  const draggedId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

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

  const persistReorder = async (ordered: Video[]) => {
    setReordering(true);
    try {
      await reorderVideos(ordered.map((v) => v.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sắp xếp thất bại');
      fetchVideos();
    } finally {
      setReordering(false);
    }
  };

  const handleDragStart = (id: string) => {
    draggedId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId.current !== id) setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const fromId = draggedId.current;
    if (!fromId || fromId === targetId) {
      setDragOverId(null);
      return;
    }
    const items = [...videos];
    const from = items.findIndex((v) => v.id === fromId);
    const to = items.findIndex((v) => v.id === targetId);
    const [item] = items.splice(from, 1);
    items.splice(to, 0, item);
    setVideos(items);
    setDragOverId(null);
    draggedId.current = null;
    persistReorder(items);
  };

  const handleDragEnd = () => {
    draggedId.current = null;
    setDragOverId(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Video</h1>
          <p className="text-stone-500 text-sm mt-0.5">{videos.length} video — kéo thả để sắp xếp thứ tự</p>
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

      {/* Add form modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
              <h3 className="font-semibold text-stone-800">Thêm video mới</h3>
              <button onClick={() => setShowAdd(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Tiêu đề video</label>
                <input
                  type="text"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  required
                  placeholder="Nhập tiêu đề video..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">URL YouTube</label>
                <input
                  type="url"
                  value={addUrl}
                  onChange={(e) => setAddUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
                />
                {addUrl && extractYouTubeId(addUrl) && (
                  <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    URL hợp lệ (ID: {extractYouTubeId(addUrl)})
                  </p>
                )}
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors">Hủy</button>
                <button type="submit" disabled={adding} className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-60">
                  {adding ? 'Đang thêm...' : 'Thêm video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drag-and-drop video list */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {reordering && (
          <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-amber-400 border-t-amber-700 rounded-full animate-spin" />
            Đang lưu thứ tự...
          </div>
        )}
        {loading ? (
          <div className="p-5 space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-10 rounded-lg bg-stone-100 flex-shrink-0" />
                <div className="flex-1 h-4 bg-stone-100 rounded" />
                <div className="h-3 w-20 bg-stone-100 rounded" />
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="px-5 py-12 text-center text-stone-400 text-sm">Chưa có video nào</div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {videos.map((video, idx) => {
              const ytId = extractYouTubeId(video.youtubeUrl);
              return (
                <li
                  key={video.id}
                  draggable
                  onDragStart={() => handleDragStart(video.id)}
                  onDragOver={(e) => handleDragOver(e, video.id)}
                  onDrop={(e) => handleDrop(e, video.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-all cursor-grab active:cursor-grabbing select-none ${
                    dragOverId === video.id
                      ? 'bg-red-50 border-l-4 border-red-400'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  {/* Drag handle */}
                  <svg className="w-4 h-4 text-stone-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  </svg>

                  {/* Order number */}
                  <span className="text-xs text-stone-400 font-mono w-4 text-center flex-shrink-0">{idx + 1}</span>

                  {/* Thumbnail */}
                  {ytId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/default.jpg`}
                      alt={video.title}
                      className="w-16 h-10 rounded-lg object-cover flex-shrink-0 bg-stone-100"
                    />
                  ) : (
                    <div className="w-16 h-10 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}

                  {/* Title + URL */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 text-sm truncate">{video.title}</p>
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline truncate block max-w-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {video.youtubeUrl}
                    </a>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteTarget(video)}
                    className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    Xóa
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {!loading && videos.length > 0 && (
        <p className="text-xs text-stone-400 text-center">Kéo thả để thay đổi thứ tự hiển thị trên trang chủ</p>
      )}

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
