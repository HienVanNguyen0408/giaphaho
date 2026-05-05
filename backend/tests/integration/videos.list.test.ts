import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

vi.mock('../../src/lib/prisma', () => ({
  default: {
    video: {
      findMany: vi.fn(),
    },
  },
}));

import prisma from '../../src/lib/prisma';

const mockVideos = [
  {
    id: '6650a1b2c3d4e5f6a7b8c9f0',
    title: 'Video 1',
    youtubeUrl: 'https://youtube.com/watch?v=abc123',
    thumbnailUrl: null,
    order: 1,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    id: '6650a1b2c3d4e5f6a7b8c9f1',
    title: 'Video 2',
    youtubeUrl: 'https://youtube.com/watch?v=def456',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    order: 2,
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
  },
  {
    id: '6650a1b2c3d4e5f6a7b8c9f2',
    title: 'Video 3',
    youtubeUrl: 'https://youtube.com/watch?v=ghi789',
    thumbnailUrl: null,
    order: 3,
    createdAt: new Date('2024-01-03T00:00:00.000Z'),
  },
];

describe('GET /api/videos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with an array of videos', async () => {
    vi.mocked(prisma.video.findMany).mockResolvedValue(mockVideos as never);

    const res = await request(app).get('/api/videos');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(3);
  });

  it('calls findMany ordered by order asc', async () => {
    vi.mocked(prisma.video.findMany).mockResolvedValue(mockVideos as never);

    await request(app).get('/api/videos');

    expect(prisma.video.findMany).toHaveBeenCalledWith({
      orderBy: { order: 'asc' },
    });
  });

  it('returns videos in ascending order by order field', async () => {
    vi.mocked(prisma.video.findMany).mockResolvedValue(mockVideos as never);

    const res = await request(app).get('/api/videos');

    expect(res.status).toBe(200);
    const orders = res.body.data.map((v: { order: number }) => v.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it('returns required fields for each video', async () => {
    vi.mocked(prisma.video.findMany).mockResolvedValue(mockVideos as never);

    const res = await request(app).get('/api/videos');

    expect(res.status).toBe(200);
    for (const video of res.body.data) {
      expect(video).toHaveProperty('id');
      expect(video).toHaveProperty('title');
      expect(video).toHaveProperty('youtubeUrl');
      expect(video).toHaveProperty('order');
    }
  });

  it('returns empty array when no videos exist', async () => {
    vi.mocked(prisma.video.findMany).mockResolvedValue([] as never);

    const res = await request(app).get('/api/videos');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});
