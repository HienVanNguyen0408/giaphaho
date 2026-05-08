'use client';

import { useEffect, useState, FormEvent, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getNewsBySlug, createNews, updateNews } from '@/lib/api';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import ImageUrlInput from '@/components/shared/ImageUrlInput';
import RichTextEditor from '@/components/admin/ui/RichTextEditor';
import type { NewsDetail } from '@/types';

import { getNewsById } from '@/lib/api';

function TinTucEditContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const [fetchLoading, setFetchLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    setFetchLoading(true);
    // Use getNewsById since admin works with IDs
    getNewsById(id)
      .then((res) => {
        const d: NewsDetail = res.data;
        setTitle(d.title);
        setContent(d.content);
        setThumbnail(d.thumbnail ?? '');
        setIsPinned(d.isPinned);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Không thể tải bài viết'))
      .finally(() => setFetchLoading(false));
  }, [id, isNew]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return;
    }
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      if (isNew) {
        await createNews({
          title: title.trim(),
          content,
          thumbnail: thumbnail.trim() || undefined,
          isPinned,
        });
      } else {
        await updateNews(id, {
          title: title.trim(),
          content,
          thumbnail: thumbnail.trim() || undefined,
          isPinned,
        });
      }
      router.push('/admin/tin-tuc');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <Link href="/admin/tin-tuc" className="hover:text-stone-800 transition-colors">
          Tin tức
        </Link>
        <span>/</span>
        <span className="text-stone-800 font-medium">
          {isNew ? 'Thêm bài viết' : 'Sửa bài viết'}
        </span>
      </div>

      <AdminPageHeader
        title={isNew ? 'Thêm bài viết mới' : 'Sửa bài viết'}
        eyebrow="Quản trị nội dung"
        description={isNew ? 'Tạo bài viết mới cho trang tin tức.' : 'Cập nhật tiêu đề, nội dung và trạng thái ghim của bài viết.'}
      />

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
            {success}
          </div>
        )}

        {fetchLoading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-3 w-20 bg-stone-100 rounded mb-2" />
                <div className="h-10 bg-stone-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Nhập tiêu đề bài viết"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--t-text-2)' }}>
                Nội dung
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
              />
            </div>

            {/* Thumbnail */}
            <ImageUrlInput
              value={thumbnail || null}
              onChange={(url) => setThumbnail(url ?? '')}
              label="Ảnh đại diện bài viết"
            />

            {/* isPinned */}
            <div className="flex items-center gap-3">
              <input
                id="isPinned"
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-red-600 focus:ring-red-400"
              />
              <label htmlFor="isPinned" className="text-sm font-medium text-stone-700">
                Ghim bài viết này lên đầu
              </label>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-red-800 text-white font-semibold text-sm hover:bg-red-900 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : isNew ? 'Đăng bài viết' : 'Cập nhật bài viết'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function TinTucEditPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-10 bg-stone-200 rounded w-1/4"></div><div className="h-64 bg-stone-200 rounded"></div></div>}>
      <TinTucEditContent />
    </Suspense>
  );
}
