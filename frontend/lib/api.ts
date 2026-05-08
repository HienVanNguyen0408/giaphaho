import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Member,
  MemberDetail,
  NewsListItem,
  NewsDetail,
  PaginatedNews,
  PaginatedVideo,
  Video,
  Section,
  FooterConfig,
  ActivityLog,
  DashboardStats,
  AnalyticsSummary,
  SearchResults,
} from '@/types';

const SERVER_API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const BROWSER_API_PROXY_BASE = '/proxy';
const BASE_URL = typeof window === 'undefined' ? SERVER_API_URL : BROWSER_API_PROXY_BASE;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (res.status === 204) {
    return { success: true, data: null as T, message: '' };
  }

  const raw = await res.text();
  const json = raw ? (JSON.parse(raw) as ApiResponse<T>) : ({ success: res.ok, data: null as T, message: '' } satisfies ApiResponse<T>);

  if (!res.ok) {
    const err = Object.assign(new Error(json.message ?? `API error ${res.status}`), {
      statusCode: res.status,
    });
    throw err;
  }
  return json;
}

// ====== AUTH ======
export const login = (username: string, password: string) =>
  apiFetch<User>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const logout = () => apiFetch<null>('/api/auth/logout', { method: 'POST' });

export const getMe = () => apiFetch<User>('/api/auth/me');

// ====== MEMBERS ======
export const getMembers = () => apiFetch<Member[]>('/api/members');

export const getMembersPage = (page = 1, limit = 12, name?: string) =>
  apiFetch<PaginatedResponse<Member>>(
    `/api/members?page=${page}&limit=${limit}${name ? `&name=${encodeURIComponent(name)}` : ''}`,
  );

export const getMember = (id: string) => apiFetch<MemberDetail>(`/api/members/${id}`);

export const createMember = (data: Partial<Member>) =>
  apiFetch<Member>('/api/members', { method: 'POST', body: JSON.stringify(data) });

export const updateMember = (id: string, data: Partial<Member>) =>
  apiFetch<Member>(`/api/members/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteMember = (id: string) =>
  apiFetch<null>(`/api/members/${id}`, { method: 'DELETE' });

// ====== NEWS ======
export const getNewsList = (page = 1, limit = 10, keyword?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (keyword) params.set('keyword', keyword);
  return apiFetch<PaginatedNews>(`/api/news?${params}`);
};

export const getPinnedNews = () => apiFetch<NewsListItem[]>('/api/news/pinned');

export const getNewsBySlug = (slug: string) => apiFetch<NewsDetail>(`/api/news/slug/${slug}`);

export const getNewsById = (id: string) => apiFetch<NewsDetail>(`/api/news/${id}`);

export const createNews = (data: {
  title: string;
  content: string;
  thumbnail?: string;
  isPinned?: boolean;
}) => apiFetch<NewsDetail>('/api/news', { method: 'POST', body: JSON.stringify(data) });

export const updateNews = (
  id: string,
  data: Partial<{ title: string; content: string; thumbnail: string; isPinned: boolean }>,
) => apiFetch<NewsDetail>(`/api/news/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteNews = (id: string) => apiFetch<null>(`/api/news/${id}`, { method: 'DELETE' });

export const togglePin = (id: string) =>
  apiFetch<{ isPinned: boolean }>(`/api/news/${id}/pin`, { method: 'PATCH' });

// ====== VIDEOS ======
export const getVideoList = (page = 1, limit = 12, keyword?: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (keyword) params.set('keyword', keyword);
  return apiFetch<PaginatedVideo>(`/api/videos?${params}`);
};

export const createVideo = (data: { title: string; youtubeUrl: string; thumbnailUrl?: string }) =>
  apiFetch<Video>('/api/videos', { method: 'POST', body: JSON.stringify(data) });

export const updateVideo = (id: string, data: Partial<Video>) =>
  apiFetch<Video>(`/api/videos/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteVideo = (id: string) =>
  apiFetch<null>(`/api/videos/${id}`, { method: 'DELETE' });

export const reorderVideos = (orderedIds: string[], startIndex = 0) =>
  apiFetch<null>('/api/videos/reorder', { method: 'PATCH', body: JSON.stringify({ orderedIds, startIndex }) });

export const reorderNews = (orderedIds: string[], startIndex = 0) =>
  apiFetch<null>('/api/news/reorder', { method: 'PATCH', body: JSON.stringify({ orderedIds, startIndex }) });

// ====== SECTIONS ======
export const getSections = (all = false) =>
  apiFetch<Section[]>(`/api/sections${all ? '?all=true' : ''}`);

export const createSection = (data: Partial<Section>) =>
  apiFetch<Section>('/api/sections', { method: 'POST', body: JSON.stringify(data) });

export const updateSection = (id: string, data: Partial<Section>) =>
  apiFetch<Section>(`/api/sections/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const toggleSection = (id: string) =>
  apiFetch<{ isActive: boolean }>(`/api/sections/${id}/toggle`, { method: 'PATCH' });

export const deleteSection = (id: string) =>
  apiFetch<null>(`/api/sections/${id}`, { method: 'DELETE' });

export const reorderSections = (orderedIds: string[]) =>
  apiFetch<null>('/api/sections/reorder', { method: 'PATCH', body: JSON.stringify({ orderedIds }) });

// ====== FOOTER ======
export const getFooter = () => apiFetch<FooterConfig>('/api/footer');

export const updateFooter = (data: Omit<FooterConfig, 'id'>) =>
  apiFetch<FooterConfig>('/api/footer', { method: 'PUT', body: JSON.stringify(data) });

// ====== ACTIVITY LOGS ======
export const getActivityLogs = (page = 1, limit = 20) =>
  apiFetch<{ items: ActivityLog[]; total: number; page: number; totalPages: number }>(
    `/api/activity-logs?page=${page}&limit=${limit}`,
  );

export const exportMembers = async (format: 'json' | 'md' | 'html'): Promise<void> => {
  const res = await fetch(`${BASE_URL}/api/members/export?format=${format}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    let message = 'Export thất bại';
    try { message = (JSON.parse(text) as ApiResponse).message ?? message; } catch { /* noop */ }
    throw new Error(message);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `giaphaho-${date}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importMembers = (data: { members: unknown[]; mode?: 'merge' | 'replace' }) =>
  apiFetch<{ created: number; updated: number; total: number }>('/api/members/import', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const recalculateMemberStats = () =>
  apiFetch<{ jobId: string }>('/api/members/recalculate-stats', { method: 'POST' });

// Returns an EventSource for SSE-based progress updates.
// Call .close() when done to clean up.
export function subscribeRecalculateEvents(
  jobId: string,
  handlers: {
    onProgress?: (data: { step: string; processed: number; total: number }) => void;
    onDone?: (data: { updated: number; durationMs: number }) => void;
    onError?: (data: { message: string }) => void;
  },
): EventSource {
  const url = `${BROWSER_API_PROXY_BASE}/api/members/recalculate-stats/events?jobId=${encodeURIComponent(jobId)}`;
  const es = new EventSource(url, { withCredentials: true });

  if (handlers.onProgress) {
    es.addEventListener('progress', (e) => {
      handlers.onProgress!(JSON.parse((e as MessageEvent).data));
    });
  }
  if (handlers.onDone) {
    es.addEventListener('done', (e) => {
      handlers.onDone!(JSON.parse((e as MessageEvent).data));
    });
  }
  if (handlers.onError) {
    es.addEventListener('error', (e) => {
      try {
        handlers.onError!(JSON.parse((e as MessageEvent).data ?? '{}'));
      } catch {
        handlers.onError!({ message: 'Kết nối thất bại' });
      }
    });
  }

  return es;
}

// ====== DASHBOARD ======
export const getDashboard = () => apiFetch<DashboardStats>('/api/dashboard');

// ====== ANALYTICS ======
export const getAnalyticsSummary = (days = 7) =>
  apiFetch<AnalyticsSummary>(`/api/analytics/summary?days=${days}`);

export const trackAnalyticsEvent = (data: {
  eventType?: string;
  path: string;
  title?: string;
  targetType?: string;
  targetId?: string;
  visitorId?: string;
  referrer?: string;
}) =>
  fetch(`${BASE_URL}/api/analytics`, {
    method: 'POST',
    credentials: 'include',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => undefined);

// ====== SEARCH ======
export const search = (q: string) =>
  apiFetch<SearchResults>(`/api/search?q=${encodeURIComponent(q)}`);

// ====== UPLOAD ======
export const uploadFile = async (file: File): Promise<{ url: string; publicId: string }> => {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  const json = (await res.json()) as ApiResponse<{ url: string; publicId: string }>;
  if (!res.ok) throw new Error(json.message);
  return json.data;
};
