'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getNewsList } from '@/lib/api';
import type { NewsListItem } from '@/types';
import { normalizeImageUrl } from '@/lib/imageUrl';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function NewsCard({ item }: { item: NewsListItem }) {
  return (
    <Link
      href={`/tin-tuc/${item.slug}`}
      className="group flex flex-col rounded-xl overflow-hidden transition-all duration-300 deal-card"
      style={{
        background: 'var(--t-surface)',
        border: '1px solid var(--t-border)',
      }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-[16/9]" style={{ background: 'var(--t-surface-2)' }}>
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={normalizeImageUrl(item.thumbnail)}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'var(--t-accent)' }}
          >
            <span
              className="text-6xl select-none"
              style={{ color: 'color-mix(in oklch, var(--t-nav-active-text) 25%, transparent)' }}
              aria-hidden="true"
            >
              鳳
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--t-accent)' }}>
          {formatDate(item.publishedAt)}
        </p>
        <h3
          className="font-semibold text-sm sm:text-base leading-snug mb-3 flex-1 line-clamp-2 transition-colors"
          style={{ color: 'var(--t-text)' }}
        >
          {item.title}
        </h3>
        <span
          className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
          style={{ color: 'var(--t-accent)' }}
        >
          Đọc tiếp
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

interface Props {
  initialNews: NewsListItem[];
  totalPages: number;
}

export default function TinTucSection({ initialNews, totalPages }: Props) {
  const [news, setNews] = useState<NewsListItem[]>(initialNews);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const goToPage = async (nextPage: number) => {
    if (loading || nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setLoading(true);
    try {
      const res = await getNewsList(nextPage, 3);
      setNews(res.data.items);
      setPage(nextPage);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="py-10 sm:py-14"
      aria-label="Tin tức"
      style={{ background: 'var(--t-surface-2)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: 'var(--t-accent)' }}
            >
              Cập nhật
            </p>
            <h2
              className="text-xl sm:text-3xl font-bold"
              style={{ color: 'var(--t-text)' }}
            >
              Tin Tức Dòng Họ
            </h2>
          </div>
          <Link
            href="/tin-tuc"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{
              color: 'var(--t-accent)',
              border: '1px solid var(--t-border)',
              background: 'var(--t-surface)',
            }}
          >
            Xem tất cả
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {/* Cards */}
        {news.length === 0 ? (
          <div
            className="rounded-xl p-10 text-center"
            style={{ background: 'var(--t-surface)', border: '1px solid var(--t-border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--t-text-3)' }}>Chưa có tin tức nào.</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Pagination + actions */}
        {news.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={loading || page <= 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
                  style={{ border: '1px solid var(--t-border)', background: 'var(--t-surface)', color: 'var(--t-text-2)' }}
                  aria-label="Trang trước"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <span className="text-sm" style={{ color: 'var(--t-text-3)' }}>
                  <strong style={{ color: 'var(--t-text)' }}>{page}</strong> / {totalPages}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={loading || page >= totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors disabled:opacity-40"
                  style={{ border: '1px solid var(--t-border)', background: 'var(--t-surface)', color: 'var(--t-text-2)' }}
                  aria-label="Trang sau"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            )}
            <Link
              href="/tin-tuc"
              className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors sm:hidden"
              style={{
                color: 'var(--t-accent)',
                border: '1px solid var(--t-border)',
                background: 'var(--t-surface)',
              }}
            >
              Xem tất cả tin tức
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
