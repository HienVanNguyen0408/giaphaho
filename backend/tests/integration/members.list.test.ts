import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

vi.mock('../../src/lib/prisma', () => ({
  default: {
    member: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import prisma from '../../src/lib/prisma';

const mockMembers = [
  {
    id: '6650a1b2c3d4e5f6a7b8c901',
    fullName: 'Nguyen Van A',
    avatar: null,
    birthYear: 1950,
    deathYear: null,
    gender: 'male',
    chiId: null,
    parentId: null,
  },
  {
    id: '6650a1b2c3d4e5f6a7b8c902',
    fullName: 'Nguyen Van B',
    avatar: null,
    birthYear: 1975,
    deathYear: null,
    gender: 'male',
    chiId: null,
    parentId: '6650a1b2c3d4e5f6a7b8c901',
  },
];

const mockMemberDetail = {
  id: '6650a1b2c3d4e5f6a7b8c901',
  fullName: 'Nguyen Van A',
  avatar: null,
  birthYear: 1950,
  deathYear: null,
  gender: 'male',
  bio: null,
  achievements: [],
  chiId: null,
  parentId: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  parent: null,
  children: [{ id: '6650a1b2c3d4e5f6a7b8c902', fullName: 'Nguyen Van B' }],
};

describe('GET /api/members', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with array of members with correct shape', async () => {
    vi.mocked(prisma.member.findMany).mockResolvedValue(mockMembers as never);

    const res = await request(app).get('/api/members');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);

    const first = res.body.data[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('fullName');
    expect(first).toHaveProperty('parentId');
  });

  it('returns empty array when no members exist', async () => {
    vi.mocked(prisma.member.findMany).mockResolvedValue([] as never);

    const res = await request(app).get('/api/members');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('GET /api/members/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with parent and children fields when member exists', async () => {
    vi.mocked(prisma.member.findUnique).mockResolvedValue(mockMemberDetail as never);

    const res = await request(app).get('/api/members/6650a1b2c3d4e5f6a7b8c901');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('parent');
    expect(res.body.data).toHaveProperty('children');
    expect(res.body.data.id).toBe('6650a1b2c3d4e5f6a7b8c901');
    expect(res.body.data.fullName).toBe('Nguyen Van A');
    expect(Array.isArray(res.body.data.children)).toBe(true);
    expect(res.body.data.children).toHaveLength(1);
    expect(res.body.data.children[0]).toHaveProperty('id');
    expect(res.body.data.children[0]).toHaveProperty('fullName');
  });

  it('returns 404 when member does not exist', async () => {
    vi.mocked(prisma.member.findUnique).mockResolvedValue(null as never);

    const res = await request(app).get('/api/members/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
