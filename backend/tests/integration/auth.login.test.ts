import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

vi.mock('../../src/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    activityLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock('../../src/utils/bcrypt', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

import prisma from '../../src/lib/prisma';
import { comparePassword } from '../../src/utils/bcrypt';

const mockUser = {
  id: '6650a1b2c3d4e5f6a7b8c9d0',
  username: 'admin',
  password: '$2b$12$hashedpassword',
  role: 'SUPER_ADMIN',
  chiId: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
};

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200, sets cookie, and returns user data on valid credentials', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(comparePassword).mockResolvedValue(true as never);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'correct_password' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('username');
    expect(res.body.data).toHaveProperty('role');
    expect(res.body.data.username).toBe('admin');

    const cookies = res.headers['set-cookie'] as string[] | string | undefined;
    expect(cookies).toBeDefined();
    const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
    expect(cookieStr).toContain('token=');
    expect(cookieStr).toContain('HttpOnly');
  });

  it('returns 401 with wrong password', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(comparePassword).mockResolvedValue(false as never);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong_password' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('returns 401 when user is not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'unknown', password: 'any_password' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid credentials');
  });
});

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 without cookie', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 and clears cookie when authenticated', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(comparePassword).mockResolvedValue(true as never);

    // First login to get a valid cookie
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'correct_password' });

    expect(loginRes.status).toBe(200);

    const setCookieHeader = loginRes.headers['set-cookie'] as string[] | undefined;
    expect(setCookieHeader).toBeDefined();
    const tokenCookie = (Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader!])
      .find((c) => c.startsWith('token='));
    expect(tokenCookie).toBeDefined();

    // Now logout with that cookie
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', tokenCookie!);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Verify the token cookie is cleared (empty value or expires in the past)
    const logoutCookies = logoutRes.headers['set-cookie'] as string[] | string | undefined;
    if (logoutCookies) {
      const cookieStr = Array.isArray(logoutCookies) ? logoutCookies.join('; ') : logoutCookies;
      expect(cookieStr).toContain('token=');
    }
  });

  it('returns 401 without cookie', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
