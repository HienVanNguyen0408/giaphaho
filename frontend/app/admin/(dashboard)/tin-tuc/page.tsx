'use client';

import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import Link from 'next/link';
import { deleteNews, getNewsList, reorderNews, togglePin } from '@/lib/api';
import { AdminActionButton, AdminActionLink } from '@/components/admin/ui/AdminActionButton';
import AdminPageHeader, { AdminMetaChip } from '@/components/admin/ui/AdminPageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { NewsListItem } from '@/types';

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

const PAGE_LIMIT = 15;

type IconProps = { className?: string };

function GripIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  );
}

function PlusIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
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

function PinIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v5m0-5-5-5V7h10v5l-5 5zM9 7V3h6v4" />
    </svg>
  );
}

function PinOffIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18M12 17v5m0-5-5-5V7h.5M9 7V4.5m6 0V7h2v5l-.8.8M9.7 14.7 12 17l2.3-2.3M10.5 3h3" />
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

function ChevronLeftIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function ImageIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5zm10.5-11.25h.008v.008h-.008V8.25z" />
    </svg>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function TinTucAdminPage() {
  const [items, setItems] = useState<NewsListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const draggedId = useRef<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pinnedCount = useMemo(() => items.filter((item) => item.isPinned).length, [items]);

  const fetchNews = (page: number, keyword?: string) => {
    setLoading(true);
    setError(null);
    getNewsList(page, PAGE_LIMIT, keyword || undefined)
      .then((res) => {
        setItems(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setCurrentPage(res.data.page);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNews(1);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchQuery(value);
      fetchNews(1, value.trim() || undefined);
    }, 400);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    fetchNews(1, undefined);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteNews(deleteTarget.id);
      const newTotal = total - 1;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / PAGE_LIMIT));
      const nextPage = currentPage > newTotalPages ? newTotalPages : currentPage;
      fetchNews(nextPage);
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePin = async (item: NewsListItem) => {
    setTogglingId(item.id);
    setError(null);
    try {
      await togglePin(item.id);
      setItems((current) => current.map((news) => (
        news.id === item.id ? { ...news, isPinned: !news.isPinned } : news
      )));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setTogglingId(null);
    }
  };

  const persistReorder = async (ordered: NewsListItem[], previous: NewsListItem[]) => {
    setReordering(true);
    setError(null);
    try {
      const startIndex = (currentPage - 1) * PAGE_LIMIT;
      await reorderNews(ordered.map((item) => item.id), startIndex);
    } catch (err) {
      setItems(previous);
      setError(err instanceof Error ? err.message : 'Sắp xếp thất bại');
    } finally {
      setReordering(false);
    }
  };

  const handleDragStart = (id: string) => {
    draggedId.current = id;
  };

  const handleDragOver = (e: DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId.current && draggedId.current !== id) setDragOverId(id);
  };

  const handleDrop = (e: DragEvent, targetId: string) => {
    e.preventDefault();
    const fromId = draggedId.current;
    if (!fromId || fromId === targetId) {
      setDragOverId(null);
      return;
    }

    const previous = [...items];
    const ordered = [...items];
    const from = ordered.findIndex((item) => item.id === fromId);
    const to = ordered.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;

    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    setItems(ordered);
    setDragOverId(null);
    draggedId.current = null;
    persistReorder(ordered, previous);
  };

  const handleDragEnd = () => {
    draggedId.current = null;
    setDragOverId(null);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    fetchNews(page, searchQuery.trim() || undefined);
  };

  const startIndex = (currentPage - 1) * PAGE_LIMIT;

  return (
    <div className="w-full space-y-5">
      <AdminPageHeader
        title="Tin tức"
        eyebrow="Quản trị nội dung"
        description="Quản lý bài viết hiển thị trên trang chủ và trang tin tức."
        meta={
          <>
            <AdminMetaChip label="Tổng" value={`${total} bài viết`} tone="blue" />
            <AdminMetaChip label="Ghim (trang này)" value={`${pinnedCount} bài`} tone="amber" />
            <AdminMetaChip label="Sắp xếp" value="Kéo thả trong trang" />
          </>
        }
        actions={
          <Link
            href="/admin/tin-tuc/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-900"
          >
            <PlusIcon />
            Thêm bài viết
          </Link>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

      <div className="w-full overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="grid grid-cols-[64px_minmax(0,1.7fr)_160px_148px] gap-5 border-b border-stone-200 bg-stone-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500 max-md:hidden lg:px-5">
          <span>STT</span>
          <span>Bài viết</span>
          <span>Ngày đăng</span>
          <span className="text-right">Thao tác</span>
        </div>

        {reordering && (
          <div className="flex items-center gap-2 border-b border-amber-100 bg-amber-50 px-5 py-2 text-xs text-amber-700">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-300 border-t-amber-700" />
            Đang lưu thứ tự bài viết...
          </div>
        )}

        {loading ? (
          <div className="space-y-3 p-5">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex animate-pulse items-center gap-4">
                <div className="h-12 w-16 rounded-xl bg-stone-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-stone-100" />
                  <div className="h-3 w-1/3 rounded bg-stone-100" />
                </div>
                <div className="h-9 w-32 rounded bg-stone-100" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-stone-100 text-stone-400">
              <ImageIcon />
            </div>
            {searchQuery ? (
              <>
                <p className="mt-3 text-sm font-medium text-stone-700">Không tìm thấy bài viết nào</p>
                <p className="mt-1 text-xs text-stone-400">Thử tìm kiếm với từ khóa khác.</p>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm font-medium text-stone-700">Chưa có bài viết nào</p>
                <p className="mt-1 text-xs text-stone-400">Tạo bài viết đầu tiên để hiển thị trên trang tin tức.</p>
              </>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {items.map((item, index) => (
              <li
                key={item.id}
                draggable={!searchQuery}
                onDragStart={searchQuery ? undefined : () => handleDragStart(item.id)}
                onDragOver={searchQuery ? undefined : (event) => handleDragOver(event, item.id)}
                onDrop={searchQuery ? undefined : (event) => handleDrop(event, item.id)}
                onDragEnd={searchQuery ? undefined : handleDragEnd}
                className={`grid grid-cols-[64px_minmax(0,1.7fr)_160px_148px] items-center gap-5 px-4 py-4 transition-colors max-md:grid-cols-[1fr_auto] max-md:gap-3 lg:px-5 ${
                  searchQuery ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                } ${
                  dragOverId === item.id ? 'bg-red-50 ring-1 ring-inset ring-red-200' : 'hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2 text-stone-400 max-md:hidden">
                  <GripIcon className="h-4 w-4" />
                  <span className="font-mono text-xs">{startIndex + index + 1}</span>
                </div>

                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                    {item.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-stone-400">
                        <ImageIcon />
                      </div>
                    )}
                    {item.isPinned && (
                      <span className="absolute left-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                        Ghim
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/admin/tin-tuc/${item.id}`}
                      className="line-clamp-2 text-sm font-semibold text-stone-950 hover:text-red-800"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <span>/{item.slug}</span>
                      <span className="h-1 w-1 rounded-full bg-stone-300" />
                      <span>Cập nhật {formatDate(item.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-stone-600 max-md:hidden">{formatDate(item.publishedAt)}</div>

                <div className="flex justify-end gap-2 overflow-visible">
                  <AdminActionLink
                    href={`/admin/tin-tuc/${item.id}`}
                    label="Sửa bài viết"
                    tone="blue"
                  >
                    <EditIcon />
                  </AdminActionLink>
                  <AdminActionButton
                    label={item.isPinned ? 'Bỏ ghim bài viết' : 'Ghim bài viết'}
                    tone="amber"
                    disabled={togglingId === item.id}
                    onClick={() => handleTogglePin(item)}
                  >
                    {item.isPinned ? <PinOffIcon /> : <PinIcon />}
                  </AdminActionButton>
                  <AdminActionButton label="Xóa bài viết" tone="red" onClick={() => setDeleteTarget(item)}>
                    <TrashIcon />
                  </AdminActionButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!loading && items.length > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white px-4 py-3">
          <span className="text-xs text-stone-500">
            Trang <strong className="text-stone-800">{currentPage}</strong> / {totalPages}
            <span className="ml-2 text-stone-400">({total} bài viết)</span>
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

      {!loading && items.length > 0 && (
        <p className="text-center text-xs text-stone-400">
          Kéo thả để thay đổi thứ tự trong trang hiện tại. Thứ tự sẽ được lưu ngay sau khi thả.
        </p>
      )}

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
