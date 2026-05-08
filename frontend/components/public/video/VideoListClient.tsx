'use client';

import { useState, useEffect } from 'react';
import { getVideoList } from '@/lib/api';
import type { Video } from '@/types';

const PAGE_SIZE = 9;

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) return parsed.pathname.slice(1).split('?')[0] || null;
    if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.replace('/embed/', '').split('?')[0] || null;
    if (parsed.pathname.startsWith('/watch') || parsed.pathname === '/') return parsed.searchParams.get('v');
    return null;
  } catch {
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return m?.[1] ?? null;
  }
}

function VideoCard({ video }: { video: Video }) {
  const videoId = extractYouTubeId(video.youtubeUrl);
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-100 flex flex-col">
      <div className="relative w-full aspect-video bg-stone-900">
        {videoId ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-stone-100 flex items-center justify-center text-stone-400 text-sm">
            Không thể tải video
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <h2 className="text-sm sm:text-base font-semibold text-stone-800 leading-snug line-clamp-2">
          {video.title}
        </h2>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {[...Array(PAGE_SIZE)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse">
          <div className="aspect-video bg-stone-100" />
          <div className="p-4 space-y-2">
            <div className="h-4 rounded w-3/4 bg-stone-100" />
            <div className="h-3 rounded w-1/2 bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VideoListClient() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchPage = async (nextPage: number) => {
    setLoading(true);
    try {
      const res = await getVideoList(nextPage, PAGE_SIZE);
      setVideos(res.data.items);
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
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-stone-400">Chưa có video nào.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
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
