// ====== AUTH ======
export type Role = 'SUPER_ADMIN' | 'CHI_ADMIN';

export interface User {
  id: string;
  username: string;
  role: Role;
  chiId: string | null;
}

// ====== MEMBER ======
export type FieldConfig = Partial<Record<'birthDate' | 'residence' | 'nationalId' | 'phone' | 'email' | 'bankAccount', boolean>>;

export interface Member {
  id: string;
  fullName: string;
  avatar: string | null;
  birthYear: number | null;
  birthDate: string | null;
  deathYear: number | null;
  deathDate: string | null;
  gender: string | null;
  bio: string | null;
  achievements: string[];
  parentId: string | null;
  chiId: string | null;
  descendantsCount: number | null;
  generation: number | null;
  siblingsCount: number | null;
  spousesCount: number | null;
  sonsCount: number | null;
  daughtersCount: number | null;
  // Extended profile
  residence: string | null;
  nationalId: string | null;
  phone: string | null;
  email: string | null;
  bankAccount: string | null;
  burialPlace: string | null;
  fieldConfig: FieldConfig | null;
  // Family relations
  spouses: string[];
  motherName: string | null;
  // Contributions (separate from achievements)
  contributions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MemberDetail extends Member {
  parent: Pick<Member, 'id' | 'fullName'> | null;
  children: Pick<Member, 'id' | 'fullName' | 'gender' | 'motherName'>[];
}

// ====== NEWS ======
export interface NewsListItem {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  isPinned: boolean;
  order: number | null;
  publishedAt: string;
  updatedAt: string;
}

export interface NewsDetail extends NewsListItem {
  content: string;
}

export interface PaginatedNews {
  items: NewsListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ====== VIDEO ======
export interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  order: number;
  createdAt: string;
}

// ====== SECTION ======
export interface Section {
  id: string;
  name: string;
  newsId: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
}

// ====== FOOTER ======
export interface FooterConfig {
  id: string;
  contact: string;
  description: string;
  copyright: string;
}

// ====== NOTIFICATION ======
export interface Notification {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// ====== ACTIVITY LOG ======
export interface ActivityLog {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'username' | 'role'>;
  action: string;
  target: string;
  targetId: string | null;
  detail: string | null;
  createdAt: string;
}

// ====== API ======
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalMembers: number;
  totalNews: number;
  totalVideos: number;
  unreadNotifications: number;
  recentLogs: ActivityLog[];
}

export interface SearchResults {
  members: Pick<Member, 'id' | 'fullName' | 'avatar'>[];
  news: Pick<NewsListItem, 'id' | 'title' | 'slug' | 'thumbnail'>[];
  videos: Pick<Video, 'id' | 'title' | 'youtubeUrl'>[];
}
