'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { getVideoList, createVideo, updateVideo, deleteVideo, reorderVideos } from '@/lib/api';
import { AdminActionButton } from '@/components/admin/ui/AdminActionButton';
import AdminPageHeader, { AdminMetaChip } from '@/components/admin/ui/AdminPageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { Video } from '@/types';

function SearchIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  );
}

function XIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

const PAGE_LIMIT = 12;

function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21H8.084a2.25 2.25 0 0 1-2.244-1.827L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function EditIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125 16.875 4.5M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

function PlusIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
    </svg>
  );
}

function ChevronLeftIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

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
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addUrl, setAddUrl] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit
  const [editTarget, setEditTarget] = useState<Video | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editing, setEditing] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Drag state
  const draggedId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  // Search
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchVideos = (page: number, keyword?: string) => {
    setLoading(true);
    getVideoList(page, PAGE_LIMIT, keyword || undefined)
      .then((res) => {
        setVideos(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setCurrentPage(res.data.page);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVideos(1);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchQuery(value);
      fetchVideos(1, value.trim() || undefined);
    }, 400);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    fetchVideos(1, undefined);
  };

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
      fetchVideos(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thêm video thất bại');
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (video: Video) => {
    setEditTarget(video);
    setEditTitle(video.title);
    setEditUrl(video.youtubeUrl);
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editTitle.trim() || !editUrl.trim()) return;
    setEditing(true);
    setError(null);
    try {
      const ytId = extractYouTubeId(editUrl.trim());
      const thumbnailUrl = ytId
        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
        : undefined;
      await updateVideo(editTarget.id, { title: editTitle.trim(), youtubeUrl: editUrl.trim(), thumbnailUrl });
      setEditTarget(null);
      fetchVideos(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sửa video thất bại');
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVideo(deleteTarget.id);
      setDeleteTarget(null);
      const newTotal = total - 1;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / PAGE_LIMIT));
      fetchVideos(currentPage > newTotalPages ? newTotalPages : currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const persistReorder = async (ordered: Video[]) => {
    setReordering(true);
    try {
      const startIndex = (currentPage - 1) * PAGE_LIMIT;
      await reorderVideos(ordered.map((v) => v.id), startIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sắp xếp thất bại');
      fetchVideos(currentPage);
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

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    fetchVideos(page, searchQuery.trim() || undefined);
  };

  const startIndex = (currentPage - 1) * PAGE_LIMIT;

  return (
    <div className="w-full space-y-5">
      <AdminPageHeader
        title="Video"
        eyebrow="Quản trị nội dung"
        description="Quản lý video YouTube hiển thị trong khu vực video của website."
        meta={
          <>
            <AdminMetaChip label="Tổng" value={`${total} video`} tone="blue" />
            <AdminMetaChip label="Sắp xếp" value="Kéo thả trong trang" />
          </>
        }
        actions={
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--t-accent)] hover:bg-[var(--t-accent-2)] px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
          >
            {!showAdd && <PlusIcon />}
            {showAdd ? 'Hủy' : 'Thêm video'}
          </button>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-stone-400">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Tìm kiếm theo tiêu đề..."
          className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-10 text-sm text-stone-900 placeholder-stone-400 focus:border-[var(--t-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--t-accent)]"
        />
        {searchInput && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-600"
            aria-label="Xóa tìm kiếm"
          >
            <XIcon />
          </button>
        )}
      </div>

      {/* Add form modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
              <h3 className="text-base font-bold text-stone-900">Thêm video mới</h3>
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
                <button type="submit" disabled={adding} className="px-6 py-2 text-sm font-semibold text-white bg-[var(--t-accent)] hover:bg-[var(--t-accent-2)] rounded-xl transition-colors disabled:opacity-60">
                  {adding ? 'Đang thêm...' : 'Thêm video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
              <h3 className="text-base font-bold text-stone-900">Sửa video</h3>
              <button onClick={() => setEditTarget(null)} className="text-stone-400 hover:text-stone-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Tiêu đề video</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  placeholder="Nhập tiêu đề video..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[var(--t-accent)] focus:ring-1 focus:ring-[var(--t-accent)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">URL YouTube</label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[var(--t-accent)] focus:ring-1 focus:ring-[var(--t-accent)] transition-colors"
                />
                {editUrl && extractYouTubeId(editUrl) && (
                  <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--t-success)' }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    URL hợp lệ (ID: {extractYouTubeId(editUrl)})
                  </p>
                )}
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditTarget(null)} className="px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors">Hủy</button>
                <button type="submit" disabled={editing} className="px-6 py-2 text-sm font-semibold text-white bg-[var(--t-accent)] hover:bg-[var(--t-accent-2)] rounded-xl transition-colors disabled:opacity-60">
                  {editing ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drag-and-drop video list */}
      <div className="w-full bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
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
          <div className="px-5 py-12 text-center text-stone-400 text-sm">
            {searchQuery ? 'Không tìm thấy video nào với từ khóa này.' : 'Chưa có video nào'}
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {videos.map((video, idx) => {
              const ytId = extractYouTubeId(video.youtubeUrl);
              return (
                <li
                  key={video.id}
                  draggable={!searchQuery}
                  onDragStart={searchQuery ? undefined : () => handleDragStart(video.id)}
                  onDragOver={searchQuery ? undefined : (e) => handleDragOver(e, video.id)}
                  onDrop={searchQuery ? undefined : (e) => handleDrop(e, video.id)}
                  onDragEnd={searchQuery ? undefined : handleDragEnd}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-all select-none ${
                    searchQuery ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                  } ${
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
                  <span className="text-xs text-stone-400 font-mono w-6 text-center flex-shrink-0">{startIndex + idx + 1}</span>

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
                      className="text-xs text-blue-500 hover:underline truncate block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {video.youtubeUrl}
                    </a>
                  </div>

                  {/* Edit */}
                  <AdminActionButton label="Sửa video" tone="blue" onClick={() => openEdit(video)}>
                    <EditIcon />
                  </AdminActionButton>

                  {/* Delete */}
                  <AdminActionButton label="Xóa video" tone="red" onClick={() => setDeleteTarget(video)}>
                    <TrashIcon />
                  </AdminActionButton>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {!loading && videos.length > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white px-4 py-3">
          <span className="text-xs text-stone-500">
            Trang <strong className="text-stone-800">{currentPage}</strong> / {totalPages}
            <span className="ml-2 text-stone-400">({total} video)</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeftIcon />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === 'ellipsis' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-stone-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg border px-2 text-xs font-medium transition-colors ${
                      currentPage === p
                        ? 'border-[var(--t-accent)] bg-[var(--t-accent)] text-white'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <p className="text-xs text-stone-400 text-center">Kéo thả để thay đổi thứ tự hiển thị trong trang hiện tại</p>
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
