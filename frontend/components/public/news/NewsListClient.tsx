'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getNewsList } from '@/lib/api';
import type { NewsListItem } from '@/types';
import { normalizeImageUrl } from '@/lib/imageUrl';

const PAGE_SIZE = 9;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function NewsCard({ item }: { item: NewsListItem }) {
  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-100 flex flex-col">
      <div className="relative aspect-[16/9] bg-stone-100 flex-shrink-0">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={normalizeImageUrl(item.thumbnail)}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-amber-50">
            <span className="text-4xl" aria-hidden="true">Tin</span>
          </div>
        )}
        {item.isPinned && (
          <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--t-accent)', color: 'var(--t-nav-active-text)' }}>
            Ghim
          </span>
        )}
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <p className="text-xs text-stone-400 mb-2">{formatDate(item.publishedAt)}</p>
        <h2 className="font-semibold text-stone-900 text-sm sm:text-base leading-snug line-clamp-3 flex-1 mb-4">
          {item.title}
        </h2>
        <Link
          href={`/tin-tuc/${item.slug}`}
          className="self-start rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:px-0 sm:py-0 sm:hover:underline"
          style={{ background: 'color-mix(in oklch, var(--t-accent) 8%, transparent)', color: 'var(--t-accent)' }}
        >
          Đọc thêm
        </Link>
      </div>
    </article>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {[...Array(PAGE_SIZE)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse">
          <div className="aspect-[16/9] bg-stone-100" />
          <div className="p-4 space-y-2">
            <div className="h-2.5 rounded w-1/4 bg-stone-100" />
            <div className="h-4 rounded w-full bg-stone-100" />
            <div className="h-4 rounded w-3/4 bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NewsListClient() {
  const [items, setItems] = useState<NewsListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchPage = async (nextPage: number) => {
    setLoading(true);
    try {
      const res = await getNewsList(nextPage, PAGE_SIZE);
      setItems(res.data.items);
      setTotalPages(res.data.totalPages);
      setPage(nextPage);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  const goToPage = (next: number) => {
    if (next < 1 || next > totalPages || next === page || loading) return;
    fetchPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {loading ? (
        <Skeleton />
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-stone-400">Chưa có bài viết nào.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <nav
          className="mt-10 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex sm:justify-center sm:gap-3"
          aria-label="Phân trang"
        >
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="text-center px-3 py-2.5 rounded-xl border text-sm font-medium shadow-sm transition-colors sm:px-4 sm:py-2 disabled:cursor-not-allowed"
            style={page <= 1
              ? { background: 'var(--t-surface-2)', color: 'var(--t-text-3)', border: '1px solid var(--t-border)' }
              : { background: 'var(--t-surface)', color: 'var(--t-text)', border: '1px solid var(--t-border)' }
            }
          >
            Trước
          </button>

          <span className="whitespace-nowrap text-sm" style={{ color: 'var(--t-text-3)' }}>
            Trang <strong style={{ color: 'var(--t-text)' }}>{page}</strong> / {totalPages}
          </span>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="text-center px-3 py-2.5 rounded-xl border text-sm font-medium shadow-sm transition-colors sm:px-4 sm:py-2 disabled:cursor-not-allowed"
            style={page >= totalPages
              ? { background: 'var(--t-surface-2)', color: 'var(--t-text-3)', border: '1px solid var(--t-border)' }
              : { background: 'var(--t-surface)', color: 'var(--t-text)', border: '1px solid var(--t-border)' }
            }
          >
            Tiếp
          </button>
        </nav>
      )}
    </>
  );
}
