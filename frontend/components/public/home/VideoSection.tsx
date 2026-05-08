'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getVideoList } from '@/lib/api';
import type { Video } from '@/types';

function extractVideoId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&/#]+)/,
    /[?&]v=([^?&/#]+)/,
    /\/embed\/([^?&/#]+)/,
    /\/shorts\/([^?&/#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function VideoCard({ video }: { video: Video }) {
  const videoId = extractVideoId(video.youtubeUrl);

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm shadow-stone-200 border border-stone-100 hover:shadow-md hover:shadow-amber-100/40 hover:border-amber-200 transition-all duration-300">
      <div className="relative w-full aspect-video bg-stone-900">
        {videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-800">
            <p className="text-stone-400 text-sm">Không thể tải video</p>
          </div>
        )}
      </div>
      <div className="px-4 py-3 sm:py-4">
        <h3 className="text-stone-800 font-medium text-sm sm:text-base leading-snug line-clamp-2">{video.title}</h3>
      </div>
    </div>
  );
}

interface Props {
  initialVideos: Video[];
  totalPages: number;
}

export default function VideoSection({ initialVideos, totalPages }: Props) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const goToPage = async (nextPage: number) => {
    if (loading || nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setLoading(true);
    try {
      const res = await getVideoList(nextPage, 3);
      setVideos(res.data.items);
      setPage(nextPage);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-10 bg-white sm:py-14" aria-label="Video dòng họ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-7 sm:mb-10">
          <p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-2">
            Hình ảnh & âm thanh
          </p>
          <h2 className="text-xl sm:text-3xl font-bold text-stone-900 mb-3">Video Dòng Họ</h2>
          <div className="flex items-center justify-center gap-3" aria-hidden="true">
            <span className="block h-px w-12 bg-amber-300" />
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="block h-px w-12 bg-amber-300" />
          </div>
        </div>

        {/* Grid */}
        {videos.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-10 text-center">
            <p className="text-stone-500 text-sm">Chưa có video nào.</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}

        {/* Pagination + actions */}
        {videos.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={loading || page <= 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 disabled:opacity-40"
                  aria-label="Trang trước"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <span className="text-sm text-stone-500">
                  <strong className="text-stone-800">{page}</strong> / {totalPages}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={loading || page >= totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50 disabled:opacity-40"
                  aria-label="Trang sau"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            )}
            <Link
              href="/video"
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-50"
            >
              Xem tất cả video
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
