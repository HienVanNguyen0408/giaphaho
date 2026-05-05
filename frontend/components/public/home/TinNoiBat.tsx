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

export default function TinNoiBat({ news }: { news: NewsListItem[] }) {
  if (news.length === 0) {
    return (
      <section className="py-12 px-4 max-w-6xl mx-auto" aria-label="Tin nổi bật">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-amber-600 text-xl" aria-hidden="true">📌</span>
          <h2 className="text-2xl font-bold text-stone-800">Tin Nổi Bật</h2>
          <span className="flex-1 h-px bg-amber-200" aria-hidden="true" />
        </div>
        <div className="bg-stone-100 border border-stone-200 rounded-xl p-10 text-center">
          <p className="text-stone-500 text-sm">Chưa có tin nổi bật.</p>
        </div>
      </section>
    );
  }

  const featured = news[0];

  return (
    <section className="py-12 px-4 max-w-6xl mx-auto" aria-label="Tin nổi bật">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-amber-600 text-xl" aria-hidden="true">📌</span>
        <h2 className="text-2xl font-bold text-stone-800">Tin Nổi Bật</h2>
        <span className="flex-1 h-px bg-amber-200" aria-hidden="true" />
      </div>

      <Link
        href={`/tin-tuc/${featured.slug}`}
        className="group block overflow-hidden rounded-2xl bg-white shadow-md shadow-stone-200 border border-stone-100 hover:shadow-lg hover:shadow-amber-100/60 transition-shadow duration-300"
      >
        <div className="md:flex">
          {/* Thumbnail */}
          <div className="md:w-1/2 relative overflow-hidden bg-stone-100 min-h-[220px] md:min-h-[280px]">
            {featured.thumbnail ? (
              <Image
                src={featured.thumbnail}
                alt={featured.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-amber-800 flex items-center justify-center">
                <span className="text-amber-400 text-7xl select-none opacity-40" aria-hidden="true">鳳</span>
              </div>
            )}
            {/* Pin badge */}
            <span className="absolute top-3 left-3 bg-amber-500 text-red-950 text-xs font-semibold px-2.5 py-1 rounded-full shadow">
              Tin nổi bật
            </span>
          </div>

          {/* Content */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
            <p className="text-amber-600 text-xs font-medium uppercase tracking-wider mb-3">
              {formatDate(featured.publishedAt)}
            </p>
            <h3 className="text-stone-900 text-xl md:text-2xl font-bold leading-snug mb-4 group-hover:text-red-800 transition-colors">
              {featured.title}
            </h3>
            <span className="inline-flex items-center gap-1.5 text-sm text-amber-600 font-medium group-hover:gap-2.5 transition-all">
              Đọc tiếp
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
