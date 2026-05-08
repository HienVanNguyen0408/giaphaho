import type { Metadata } from 'next';
import Link from 'next/link';
import { cacheLife } from 'next/cache';
import { getNewsBySlug } from '@/lib/api';
import { normalizeImageUrl } from '@/lib/imageUrl';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  'use cache';
  cacheLife('minutes');
  try {
    return await getNewsBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await getArticle(slug);
    const article = res?.data;
    return {
      title: article?.title ?? 'Bài viết',
      description: article?.title,
      openGraph: {
        title: article?.title,
        images: article?.thumbnail ? [{ url: article.thumbnail }] : [],
        type: 'article',
        publishedTime: article?.publishedAt,
      },
    };
  } catch {
    return { title: 'Bài viết' };
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const res = await getArticle(slug);
  if (!res) return <div className="min-h-screen flex items-center justify-center text-stone-400">Không thể tải bài viết. Vui lòng thử lại sau.</div>;
  const article = res.data;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/tin-tuc"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-red-700 transition-colors mb-8 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Tin tức
        </Link>

        <article className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Thumbnail */}
          {article.thumbnail && (
            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={normalizeImageUrl(article.thumbnail)}
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          <div className="px-8 py-8">
            {/* Meta */}
            <div className="flex items-center gap-3 mb-4">
              {article.isPinned && (
                <span className="text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
                  Ghim
                </span>
              )}
              <time className="text-xs text-stone-400" dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight mb-8">
              {article.title}
            </h1>

            {/* Divider */}
            <div className="w-12 h-1 bg-red-700 rounded-full mb-8" />

            {/* Content */}
            <div
              className="prose prose-stone prose-sm sm:prose-base max-w-none
                prose-headings:font-bold prose-headings:text-stone-900
                prose-p:text-stone-700 prose-p:leading-relaxed
                prose-a:text-red-700 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-md
                prose-blockquote:border-l-red-400 prose-blockquote:text-stone-600"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </article>

        {/* Footer nav */}
        <div className="mt-8 text-center">
          <Link
            href="/tin-tuc"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-red-700 transition-colors"
          >
            ← Xem tất cả tin tức
          </Link>
        </div>
      </div>
    </div>
  );
}
