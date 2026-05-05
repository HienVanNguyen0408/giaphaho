import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { cacheLife } from 'next/cache';
import { getNewsList } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Tin tức',
  description: 'Cập nhật tin tức, sự kiện và thông báo từ dòng họ Phùng Bát Tràng.',
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

async function getNewsData(page: number) {
  'use cache';
  cacheLife('minutes');
  try {
    return await getNewsList(page, 9);
  } catch {
    return null;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default async function TinTucPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10));
  const res = await getNewsData(currentPage);
  if (!res) return <div className="min-h-screen flex items-center justify-center text-stone-400">Không thể tải tin tức. Vui lòng thử lại sau.</div>;
  const { items, totalPages } = res.data;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3">Tin tức & Sự kiện</h1>
          <p className="text-stone-500 max-w-xl mx-auto">
            Cập nhật những tin tức, sự kiện và hoạt động mới nhất của dòng họ Phùng Bát Tràng.
          </p>
          <div className="mt-4 w-16 h-1 bg-red-700 mx-auto rounded-full" />
        </div>

        {/* Grid */}
        {items.length === 0 ? (
          <div className="text-center py-20 text-stone-400">Chưa có bài viết nào.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-100 flex flex-col"
              >
                <div className="relative h-48 bg-stone-100 flex-shrink-0">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-amber-50">
                      <span className="text-4xl">📰</span>
                    </div>
                  )}
                  {item.isPinned && (
                    <span className="absolute top-2 left-2 text-xs font-semibold bg-red-700 text-white px-2 py-0.5 rounded-full">
                      Ghim
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs text-stone-400 mb-2">{formatDate(item.publishedAt)}</p>
                  <h2 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-3 flex-1 mb-4">
                    {item.title}
                  </h2>
                  <Link
                    href={`/tin-tuc/${item.slug}`}
                    className="self-start text-xs font-semibold text-red-700 hover:text-red-800 hover:underline transition-colors"
                  >
                    Đọc thêm →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-12 flex justify-center items-center gap-3" aria-label="Phân trang">
            {currentPage > 1 ? (
              <Link
                href={`/tin-tuc?page=${currentPage - 1}`}
                className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:border-red-300 hover:text-red-700 transition-colors text-sm font-medium shadow-sm"
              >
                ← Trước
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-stone-100 text-stone-300 text-sm font-medium cursor-not-allowed">
                ← Trước
              </span>
            )}

            <span className="text-sm text-stone-500">
              Trang <strong className="text-stone-800">{currentPage}</strong> / {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={`/tin-tuc?page=${currentPage + 1}`}
                className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:border-red-300 hover:text-red-700 transition-colors text-sm font-medium shadow-sm"
              >
                Tiếp →
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-stone-100 text-stone-300 text-sm font-medium cursor-not-allowed">
                Tiếp →
              </span>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
