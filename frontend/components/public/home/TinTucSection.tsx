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

function NewsCard({ item }: { item: NewsListItem }) {
  return (
    <Link
      href={`/tin-tuc/${item.slug}`}
      className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm shadow-stone-200 border border-stone-100 hover:shadow-md hover:shadow-amber-100/50 hover:border-amber-200 transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-stone-100 h-44">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-amber-800 flex items-center justify-center">
            <span className="text-amber-400/30 text-6xl select-none" aria-hidden="true">鳳</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-amber-700 text-xs font-medium mb-2">
          {formatDate(item.publishedAt)}
        </p>
        <h3 className="text-stone-800 font-semibold text-base leading-snug mb-3 flex-1 group-hover:text-red-800 transition-colors line-clamp-2">
          {item.title}
        </h3>
        <span className="text-amber-700 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
          Đọc tiếp
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default function TinTucSection({ news }: { news: NewsListItem[] }) {
  const displayNews = news.slice(0, 3);

  return (
    <section className="py-14 bg-stone-50" aria-label="Tin tức">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-1">
              Cập nhật
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Tin Tức Dòng Họ</h2>
          </div>
          <Link
            href="/tin-tuc"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-amber-700 font-medium border border-amber-300 hover:bg-amber-50 px-4 py-2 rounded-lg transition-colors"
          >
            Xem thêm
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        {/* Cards */}
        {displayNews.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-10 text-center">
            <p className="text-stone-500 text-sm">Chưa có tin tức nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayNews.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Mobile "Xem thêm" */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/tin-tuc"
            className="inline-flex items-center gap-1.5 text-sm text-amber-700 font-medium border border-amber-300 hover:bg-amber-50 px-5 py-2.5 rounded-lg transition-colors"
          >
            Xem thêm tin tức
          </Link>
        </div>
      </div>
    </section>
  );
}
