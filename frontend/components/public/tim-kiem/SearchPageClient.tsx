'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { search } from '@/lib/api';
import SearchBar from '@/components/shared/SearchBar';
import type { SearchResults } from '@/types';

export default function SearchPageClient() {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (!q) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await search(q);
      setResults(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tìm kiếm');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const totalCount = results
    ? results.members.length + results.news.length + results.videos.length
    : 0;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-stone-900">Tìm kiếm</h1>
          <p className="text-stone-500 mt-2 text-sm">
            Tìm kiếm thành viên, tin tức, và video
          </p>
        </div>

        <SearchBar
          onSearch={handleSearch}
          placeholder="Nhập từ khóa tìm kiếm (tối thiểu 2 ký tự)..."
          debounceMs={400}
        />

        {loading && (
          <div className="text-center text-stone-400 text-sm py-8">Đang tìm kiếm...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {results && query && !loading && (
          <p className="text-sm text-stone-500">
            Tìm thấy <span className="font-semibold text-stone-700">{totalCount}</span> kết quả
            cho &quot;<span className="font-semibold text-stone-700">{query}</span>&quot;
          </p>
        )}

        {results && !loading && (
          <div className="space-y-6">
            {results.members.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-stone-700 mb-3 flex items-center gap-2">
                  <span>Thành viên</span>
                  <span className="text-xs font-normal bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                    {results.members.length}
                  </span>
                </h2>
                <ul className="space-y-2">
                  {results.members.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/gia-pha/${m.id}`}
                        className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 px-4 py-3 hover:border-red-300 hover:shadow-sm transition-all"
                      >
                        {m.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.avatar}
                            alt={m.fullName}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-sm flex-shrink-0">
                            {m.fullName.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm font-medium text-stone-800">{m.fullName}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {results.news.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-stone-700 mb-3 flex items-center gap-2">
                  <span>Tin tức</span>
                  <span className="text-xs font-normal bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                    {results.news.length}
                  </span>
                </h2>
                <ul className="space-y-2">
                  {results.news.map((n) => (
                    <li key={n.id}>
                      <Link
                        href={`/tin-tuc/${n.slug}`}
                        className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 px-4 py-3 hover:border-red-300 hover:shadow-sm transition-all"
                      >
                        {n.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={n.thumbnail}
                            alt={n.title}
                            className="w-14 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 flex-shrink-0">
                            📰
                          </div>
                        )}
                        <span className="text-sm font-medium text-stone-800">{n.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {results.videos.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-stone-700 mb-3 flex items-center gap-2">
                  <span>Video</span>
                  <span className="text-xs font-normal bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                    {results.videos.length}
                  </span>
                </h2>
                <ul className="space-y-2">
                  {results.videos.map((v) => (
                    <li key={v.id}>
                      <a
                        href={v.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 px-4 py-3 hover:border-red-300 hover:shadow-sm transition-all"
                      >
                        <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                          ▶
                        </div>
                        <span className="text-sm font-medium text-stone-800">{v.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {totalCount === 0 && (
              <div className="text-center py-12 text-stone-400">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-sm">Không tìm thấy kết quả nào cho &quot;{query}&quot;</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
