import type { NewsListItem } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function DealCard({ item }: { item: NewsListItem }) {
  return (
    <Link
      href={`/tin-tuc/${item.slug}`}
      className="deal-card group flex flex-col overflow-hidden rounded-xl"
      style={{
        background: 'var(--t-surface)',
        border: '1px solid var(--t-border)',
      }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-[16/9]" style={{ background: 'var(--t-surface-2)' }}>
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'var(--t-accent)' }}
          >
            <span
              className="text-7xl select-none"
              style={{ color: 'color-mix(in oklch, var(--t-nav-active-text) 25%, transparent)' }}
              aria-hidden="true"
            >
              鳳
            </span>
          </div>
        )}

        {/* Pinned badge — VNA-style price badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider"
          style={{
            background: 'var(--t-accent)',
            color: 'var(--t-nav-active-text)',
          }}
        >
          Tin nổi bật
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <p
          className="text-[11px] font-medium uppercase tracking-wider mb-2"
          style={{ color: 'var(--t-text-3)' }}
        >
          {formatDate(item.publishedAt)}
        </p>
        <h3
          className="font-semibold text-sm sm:text-base leading-snug flex-1 mb-3 line-clamp-2 transition-colors duration-150"
          style={{ color: 'var(--t-text)' }}
        >
          {item.title}
        </h3>
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold transition-all group-hover:gap-2.5"
            style={{ color: 'var(--t-accent)' }}
          >
            Đọc tiếp
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function TinNoiBat({ news }: { news: NewsListItem[] }) {
  if (news.length === 0) return null;

  const cardsToShow = news.slice(0, 3);

  return (
    <section
      className="py-10 sm:py-16"
      style={{ background: 'var(--t-bg)' }}
      aria-label="Tin nổi bật"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header — VNA "Ưu đãi nổi bật" style */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <div
              className="w-8 h-1 rounded-full mb-3"
              style={{ background: 'var(--t-accent)' }}
              aria-hidden="true"
            />
            <h2
              className="text-xl sm:text-3xl font-bold"
              style={{ color: 'var(--t-text)' }}
            >
              Tin Nổi Bật
            </h2>
          </div>
          <Link
            href="/tin-tuc"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-150 pb-1 border-b-2"
            style={{
              color: 'var(--t-accent)',
              borderBottomColor: 'var(--t-accent)',
            }}
          >
            Xem tất cả
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        {/* Deal cards grid — VNA horizontal deals style */}
        <div
          className={`grid gap-4 sm:gap-5 ${
            cardsToShow.length === 1
              ? 'grid-cols-1 max-w-xl'
              : cardsToShow.length === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {cardsToShow.map((item) => (
            <DealCard key={item.id} item={item} />
          ))}
        </div>

        {/* Mobile "Xem tất cả" */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/tin-tuc"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-lg transition-all"
            style={{
              border: '1.5px solid var(--t-accent)',
              color: 'var(--t-accent)',
            }}
          >
            Xem tất cả tin nổi bật
          </Link>
        </div>
      </div>
    </section>
  );
}
