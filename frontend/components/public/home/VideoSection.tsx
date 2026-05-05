import type { Video } from '@/types';

function extractVideoId(url: string): string | null {
  // Handles: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID, youtube.com/shorts/ID
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
      {/* Embed */}
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
      {/* Title */}
      <div className="px-4 py-3">
        <h3 className="text-stone-800 font-medium text-sm leading-snug line-clamp-2">{video.title}</h3>
      </div>
    </div>
  );
}

export default function VideoSection({ videos }: { videos: Video[] }) {
  const displayVideos = videos.slice(0, 3);

  return (
    <section className="py-14 bg-white" aria-label="Video dòng họ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-amber-700 text-xs font-semibold uppercase tracking-widest mb-2">
            Hình ảnh & âm thanh
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-3">Video Dòng Họ</h2>
          <div className="flex items-center justify-center gap-3" aria-hidden="true">
            <span className="block h-px w-12 bg-amber-300" />
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="block h-px w-12 bg-amber-300" />
          </div>
        </div>

        {/* Grid */}
        {displayVideos.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-10 text-center">
            <p className="text-stone-500 text-sm">Chưa có video nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
