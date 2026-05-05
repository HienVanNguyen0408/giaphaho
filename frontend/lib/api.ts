import type {
  ApiResponse,
  User,
  Member,
  MemberDetail,
  NewsListItem,
  NewsDetail,
  PaginatedNews,
  Video,
  Section,
  FooterConfig,
  Notification,
  ActivityLog,
  DashboardStats,
  SearchResults,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  const json = (await res.json()) as ApiResponse<T>;
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

export const getMember = (id: string) => apiFetch<MemberDetail>(`/api/members/${id}`);

export const createMember = (data: Partial<Member>) =>
  apiFetch<Member>('/api/members', { method: 'POST', body: JSON.stringify(data) });

export const updateMember = (id: string, data: Partial<Member>) =>
  apiFetch<Member>(`/api/members/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteMember = (id: string) =>
  apiFetch<null>(`/api/members/${id}`, { method: 'DELETE' });

// ====== NEWS ======
export const getNewsList = (page = 1, limit = 10) =>
  apiFetch<PaginatedNews>(`/api/news?page=${page}&limit=${limit}`);

export const getPinnedNews = () => apiFetch<NewsListItem[]>('/api/news/pinned');

export const getNewsBySlug = (slug: string) => apiFetch<NewsDetail>(`/api/news/${slug}`);

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
export const getVideos = () => apiFetch<Video[]>('/api/videos');

export const createVideo = (data: { title: string; youtubeUrl: string; thumbnailUrl?: string }) =>
  apiFetch<Video>('/api/videos', { method: 'POST', body: JSON.stringify(data) });

export const updateVideo = (id: string, data: Partial<Video>) =>
  apiFetch<Video>(`/api/videos/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteVideo = (id: string) =>
  apiFetch<null>(`/api/videos/${id}`, { method: 'DELETE' });

export const reorderVideos = (orderedIds: string[]) =>
  apiFetch<null>('/api/videos/reorder', { method: 'PATCH', body: JSON.stringify({ orderedIds }) });

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

// ====== FOOTER ======
export const getFooter = () => apiFetch<FooterConfig>('/api/footer');

export const updateFooter = (data: Omit<FooterConfig, 'id'>) =>
  apiFetch<FooterConfig>('/api/footer', { method: 'PUT', body: JSON.stringify(data) });

// ====== NOTIFICATIONS ======
export const getNotifications = () => apiFetch<Notification[]>('/api/notifications');

export const markNotificationRead = (id: string) =>
  apiFetch<Notification>(`/api/notifications/${id}/read`, { method: 'PATCH' });

// ====== ACTIVITY LOGS ======
export const getActivityLogs = (page = 1, limit = 20) =>
  apiFetch<{ items: ActivityLog[]; total: number; page: number; totalPages: number }>(
    `/api/activity-logs?page=${page}&limit=${limit}`,
  );

// ====== DASHBOARD ======
export const getDashboard = () => apiFetch<DashboardStats>('/api/dashboard');

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
