import type { Metadata } from 'next';
import { cacheLife } from 'next/cache';
import { getVideos } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Video',
  description: 'Thư viện video về dòng họ Phùng Bát Tràng — tư liệu hình ảnh quý giá qua các thế hệ.',
};

async function getVideoData() {
  'use cache';
  cacheLife('hours');
  try {
    return await getVideos();
  } catch {
    return null;
  }
}

/**
 * Extract YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.slice(1).split('?')[0] || null;
    }

    if (parsed.pathname.startsWith('/embed/')) {
      return parsed.pathname.replace('/embed/', '').split('?')[0] || null;
    }

    if (parsed.pathname.startsWith('/watch') || parsed.pathname === '/') {
      return parsed.searchParams.get('v');
    }

    return null;
  } catch {
    // Handle non-URL strings — try regex fallback
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return m?.[1] ?? null;
  }
}

export default async function VideoPage() {
  const res = await getVideoData();
  const videos = res?.data ?? [];

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3">Thư viện Video</h1>
          <p className="text-stone-500 max-w-xl mx-auto">
            Những thước phim lưu giữ ký ức và truyền thống dòng họ Phùng Bát Tràng qua các thế hệ.
          </p>
          <div className="mt-4 w-16 h-1 bg-red-700 mx-auto rounded-full" />
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-20 text-stone-400">Chưa có video nào.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => {
              const videoId = extractYouTubeId(video.youtubeUrl);
              return (
                <div
                  key={video.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-100 flex flex-col"
                >
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
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
                  <div className="p-4">
                    <h2 className="text-sm font-semibold text-stone-800 leading-snug line-clamp-2">
                      {video.title}
                    </h2>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
