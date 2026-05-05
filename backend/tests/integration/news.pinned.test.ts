import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

vi.mock('../../src/lib/prisma', () => ({
  default: {
    news: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import prisma from '../../src/lib/prisma';

const mockPinnedNews = [
  {
    id: '6650a1b2c3d4e5f6a7b8c9d0',
    title: 'Tin ghim 1',
    slug: 'tin-ghim-1',
    content: 'Nội dung tin ghim 1',
    thumbnail: null,
    isPinned: true,
    publishedAt: new Date('2024-01-02T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  },
  {
    id: '6650a1b2c3d4e5f6a7b8c9d1',
    title: 'Tin ghim 2',
    slug: 'tin-ghim-2',
    content: 'Nội dung tin ghim 2',
    thumbnail: 'https://example.com/img.jpg',
    isPinned: true,
    publishedAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
];

describe('GET /api/news/pinned', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with an array of pinned news', async () => {
    vi.mocked(prisma.news.findMany).mockResolvedValue(mockPinnedNews as never);

    const res = await request(app).get('/api/news/pinned');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('returns only items with isPinned true', async () => {
    vi.mocked(prisma.news.findMany).mockResolvedValue(mockPinnedNews as never);

    const res = await request(app).get('/api/news/pinned');

    expect(res.status).toBe(200);
    for (const item of res.body.data) {
      expect(item.isPinned).toBe(true);
    }
  });

  it('calls findMany with isPinned: true filter and desc order', async () => {
    vi.mocked(prisma.news.findMany).mockResolvedValue([] as never);

    await request(app).get('/api/news/pinned');

    expect(prisma.news.findMany).toHaveBeenCalledWith({
      where: { isPinned: true },
      orderBy: { publishedAt: 'desc' },
    });
  });

  it('returns empty array when no pinned news exist', async () => {
    vi.mocked(prisma.news.findMany).mockResolvedValue([] as never);

    const res = await request(app).get('/api/news/pinned');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('GET /api/news', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with paginated news', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([mockPinnedNews, 2] as never);

    const res = await request(app).get('/api/news');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('items');
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('page');
    expect(res.body.data).toHaveProperty('limit');
    expect(res.body.data).toHaveProperty('totalPages');
  });

  it('uses default page=1 and limit=10', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[], 0] as never);

    const res = await request(app).get('/api/news');

    expect(res.status).toBe(200);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(10);
  });

  it('respects custom page and limit query params', async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[], 50] as never);

    const res = await request(app).get('/api/news?page=3&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.data.page).toBe(3);
    expect(res.body.data.limit).toBe(5);
  });
});

describe('GET /api/news/:slug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with the news item when found', async () => {
    vi.mocked(prisma.news.findUnique).mockResolvedValue(mockPinnedNews[0] as never);

    const res = await request(app).get('/api/news/tin-ghim-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('tin-ghim-1');
  });

  it('returns 404 when news not found', async () => {
    vi.mocked(prisma.news.findUnique).mockResolvedValue(null as never);

    const res = await request(app).get('/api/news/slug-khong-ton-tai');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
