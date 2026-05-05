import axios from 'axios';
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

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// axios throws on non-2xx automatically; extract response body
async function apiFetch<T>(
  path: string,
  config?: Parameters<typeof client.request>[0],
): Promise<ApiResponse<T>> {
  const res = await client.request<ApiResponse<T>>({ url: path, ...config });
  return res.data;
}

// ====== AUTH ======
export const login = (username: string, password: string) =>
  apiFetch<User>('/api/auth/login', { method: 'post', data: { username, password } });

export const logout = () => apiFetch<null>('/api/auth/logout', { method: 'post' });

export const getMe = () => apiFetch<User>('/api/auth/me');

// ====== MEMBERS ======
export const getMembers = () => apiFetch<Member[]>('/api/members');

export const getMember = (id: string) => apiFetch<MemberDetail>(`/api/members/${id}`);

export const createMember = (data: Partial<Member>) =>
  apiFetch<Member>('/api/members', { method: 'post', data });

export const updateMember = (id: string, data: Partial<Member>) =>
  apiFetch<Member>(`/api/members/${id}`, { method: 'put', data });

export const deleteMember = (id: string) =>
  apiFetch<null>(`/api/members/${id}`, { method: 'delete' });

// ====== NEWS ======
export const getNewsList = (page = 1, limit = 10) =>
  apiFetch<PaginatedNews>(`/api/news?page=${page}&limit=${limit}`);

export const getPinnedNews = () => apiFetch<NewsListItem[]>('/api/news/pinned');

export const getNewsBySlug = (slug: string) => apiFetch<NewsDetail>(`/api/news/${slug}`);

export const createNews = (data: { title: string; content: string; thumbnail?: string; isPinned?: boolean }) =>
  apiFetch<NewsDetail>('/api/news', { method: 'post', data });

export const updateNews = (
  id: string,
  data: Partial<{ title: string; content: string; thumbnail: string; isPinned: boolean }>,
) => apiFetch<NewsDetail>(`/api/news/${id}`, { method: 'put', data });

export const deleteNews = (id: string) => apiFetch<null>(`/api/news/${id}`, { method: 'delete' });

export const togglePin = (id: string) =>
  apiFetch<{ isPinned: boolean }>(`/api/news/${id}/pin`, { method: 'patch' });

// ====== VIDEOS ======
export const getVideos = () => apiFetch<Video[]>('/api/videos');

export const createVideo = (data: { title: string; youtubeUrl: string; thumbnailUrl?: string }) =>
  apiFetch<Video>('/api/videos', { method: 'post', data });

export const updateVideo = (id: string, data: Partial<Video>) =>
  apiFetch<Video>(`/api/videos/${id}`, { method: 'put', data });

export const deleteVideo = (id: string) =>
  apiFetch<null>(`/api/videos/${id}`, { method: 'delete' });

export const reorderVideos = (orderedIds: string[]) =>
  apiFetch<null>('/api/videos/reorder', { method: 'patch', data: { orderedIds } });

// ====== SECTIONS ======
export const getSections = (all = false) =>
  apiFetch<Section[]>(`/api/sections${all ? '?all=true' : ''}`);

export const createSection = (data: Partial<Section>) =>
  apiFetch<Section>('/api/sections', { method: 'post', data });

export const updateSection = (id: string, data: Partial<Section>) =>
  apiFetch<Section>(`/api/sections/${id}`, { method: 'put', data });

export const toggleSection = (id: string) =>
  apiFetch<{ isActive: boolean }>(`/api/sections/${id}/toggle`, { method: 'patch' });

export const deleteSection = (id: string) =>
  apiFetch<null>(`/api/sections/${id}`, { method: 'delete' });

// ====== FOOTER ======
export const getFooter = () => apiFetch<FooterConfig>('/api/footer');

export const updateFooter = (data: Omit<FooterConfig, 'id'>) =>
  apiFetch<FooterConfig>('/api/footer', { method: 'put', data });

// ====== NOTIFICATIONS ======
export const getNotifications = () => apiFetch<Notification[]>('/api/notifications');

export const markNotificationRead = (id: string) =>
  apiFetch<Notification>(`/api/notifications/${id}/read`, { method: 'patch' });

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
  const res = await client.post<ApiResponse<{ url: string; publicId: string }>>(
    '/api/upload',
    form,
    // axios sets Content-Type: multipart/form-data automatically for FormData
    { headers: { 'Content-Type': undefined } },
  );
  return res.data.data;
};
