import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

vi.mock('../../src/lib/prisma', () => ({
  default: {
    section: {
      findMany: vi.fn(),
    },
  },
}));

import prisma from '../../src/lib/prisma';

const mockActiveSections = [
  {
    id: '6650a1b2c3d4e5f6a7b8c9e0',
    name: 'Giới thiệu',
    newsId: null,
    isActive: true,
    order: 1,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    id: '6650a1b2c3d4e5f6a7b8c9e1',
    name: 'Tin tức',
    newsId: null,
    isActive: true,
    order: 2,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  },
];

const mockAllSections = [
  ...mockActiveSections,
  {
    id: '6650a1b2c3d4e5f6a7b8c9e2',
    name: 'Mục ẩn',
    newsId: null,
    isActive: false,
    order: 3,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  },
];

describe('GET /api/sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with only active sections by default', async () => {
    vi.mocked(prisma.section.findMany).mockResolvedValue(mockActiveSections as never);

    const res = await request(app).get('/api/sections');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('calls findMany with isActive: true filter when no query param', async () => {
    vi.mocked(prisma.section.findMany).mockResolvedValue(mockActiveSections as never);

    await request(app).get('/api/sections');

    expect(prisma.section.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  });

  it('returns sections ordered by order asc', async () => {
    vi.mocked(prisma.section.findMany).mockResolvedValue(mockActiveSections as never);

    const res = await request(app).get('/api/sections');

    expect(res.status).toBe(200);
    const orders = res.body.data.map((s: { order: number }) => s.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it('returns all sections when ?all=true is passed', async () => {
    vi.mocked(prisma.section.findMany).mockResolvedValue(mockAllSections as never);

    const res = await request(app).get('/api/sections?all=true');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('calls findMany without isActive filter when ?all=true', async () => {
    vi.mocked(prisma.section.findMany).mockResolvedValue(mockAllSections as never);

    await request(app).get('/api/sections?all=true');

    expect(prisma.section.findMany).toHaveBeenCalledWith({
      orderBy: { order: 'asc' },
    });
  });

  it('returns empty array when no sections exist', async () => {
    vi.mocked(prisma.section.findMany).mockResolvedValue([] as never);

    const res = await request(app).get('/api/sections');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});
