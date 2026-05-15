import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, getMe } from '../../src/services/auth.service'

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    platformAdmin: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('../../src/utils/hash', () => ({
  comparePassword: vi.fn(),
}))

vi.mock('../../src/utils/jwt', () => ({
  signToken: vi.fn(() => 'mock-jwt-token'),
}))

import { prisma } from '../../src/lib/prisma'
import { comparePassword } from '../../src/utils/hash'

const mockAdmin = {
  id: 'admin-id-123',
  email: 'admin@test.com',
  password: 'hashed-password',
  name: 'Test Admin',
  role: 'SUPER_ADMIN',
  createdAt: new Date(),
  updatedAt: new Date(),
  activityLogs: [],
}

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('returns token and admin on valid credentials', async () => {
      vi.mocked(prisma.platformAdmin.findUnique).mockResolvedValue(mockAdmin)
      vi.mocked(comparePassword).mockResolvedValue(true)

      const result = await login('admin@test.com', 'password123')

      expect(result.token).toBe('mock-jwt-token')
      expect(result.admin.email).toBe('admin@test.com')
      expect(result.admin.role).toBe('SUPER_ADMIN')
    })

    it('throws INVALID_CREDENTIALS when admin not found', async () => {
      vi.mocked(prisma.platformAdmin.findUnique).mockResolvedValue(null)

      await expect(login('wrong@test.com', 'password')).rejects.toThrow('INVALID_CREDENTIALS')
    })

    it('throws INVALID_CREDENTIALS when password wrong', async () => {
      vi.mocked(prisma.platformAdmin.findUnique).mockResolvedValue(mockAdmin)
      vi.mocked(comparePassword).mockResolvedValue(false)

      await expect(login('admin@test.com', 'wrong-password')).rejects.toThrow('INVALID_CREDENTIALS')
    })
  })

  describe('getMe', () => {
    it('returns admin data when found', async () => {
      vi.mocked(prisma.platformAdmin.findUnique).mockResolvedValue(mockAdmin)

      const result = await getMe('admin-id-123')

      expect(result.id).toBe('admin-id-123')
      expect(result.email).toBe('admin@test.com')
    })

    it('throws ADMIN_NOT_FOUND when admin does not exist', async () => {
      vi.mocked(prisma.platformAdmin.findUnique).mockResolvedValue(null)

      await expect(getMe('nonexistent-id')).rejects.toThrow('ADMIN_NOT_FOUND')
    })
  })
})
