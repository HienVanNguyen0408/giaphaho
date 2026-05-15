import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    license: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    clan: {
      findUnique: vi.fn(),
    },
    downloadLog: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'generated-license-key'),
}))

import { prisma } from '../../src/lib/prisma'
import { generateKey, revokeKey, renewKey, validateKey, getLicenseHistory } from '../../src/services/license.service'

const mockClan = { id: 'clan-id', code: 'ho-test', status: 'ACTIVE', licenseType: 'SUBSCRIPTION' }

const mockLicense = {
  id: 'lic-id',
  clanId: 'clan-id',
  type: 'SUBSCRIPTION',
  key: 'existing-key',
  isRevoked: false,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  downloadCount: 0,
  maxDownloads: 0,
  activatedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  downloadLogs: [],
}

describe('license.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateKey', () => {
    it('generates a UUID license key for valid clan', async () => {
      vi.mocked(prisma.clan.findUnique).mockResolvedValue(mockClan as never)
      vi.mocked(prisma.license.create).mockResolvedValue({ ...mockLicense, key: 'generated-license-key' } as never)

      const result = await generateKey('clan-id')

      expect(result.key).toBe('generated-license-key')
    })

    it('throws CLAN_NOT_FOUND for unknown clan', async () => {
      vi.mocked(prisma.clan.findUnique).mockResolvedValue(null)

      await expect(generateKey('unknown-clan')).rejects.toThrow('CLAN_NOT_FOUND')
    })
  })

  describe('revokeKey', () => {
    it('revokes the license', async () => {
      vi.mocked(prisma.license.findFirst).mockResolvedValue(mockLicense as never)
      vi.mocked(prisma.license.update).mockResolvedValue({ ...mockLicense, isRevoked: true } as never)

      const result = await revokeKey('clan-id', 'lic-id')

      expect(result.isRevoked).toBe(true)
    })

    it('throws LICENSE_NOT_FOUND for unknown license', async () => {
      vi.mocked(prisma.license.findFirst).mockResolvedValue(null)

      await expect(revokeKey('clan-id', 'unknown-lic')).rejects.toThrow('LICENSE_NOT_FOUND')
    })
  })

  describe('validateKey', () => {
    it('returns valid: true for active non-expired license', async () => {
      vi.mocked(prisma.license.findUnique).mockResolvedValue({
        ...mockLicense,
        clan: { code: 'ho-test', status: 'ACTIVE' },
      } as never)

      const result = await validateKey('existing-key')

      expect(result.valid).toBe(true)
      expect(result.clanCode).toBe('ho-test')
    })

    it('returns valid: false for revoked license', async () => {
      vi.mocked(prisma.license.findUnique).mockResolvedValue({
        ...mockLicense,
        isRevoked: true,
        clan: { code: 'ho-test', status: 'ACTIVE' },
      } as never)

      const result = await validateKey('existing-key')

      expect(result.valid).toBe(false)
      expect(result.reason).toBe('KEY_REVOKED')
    })

    it('returns valid: false for non-existent key', async () => {
      vi.mocked(prisma.license.findUnique).mockResolvedValue(null)

      const result = await validateKey('non-existent-key')

      expect(result.valid).toBe(false)
      expect(result.reason).toBe('KEY_NOT_FOUND')
    })
  })

  describe('renewKey', () => {
    it('extends expiry by given months', async () => {
      vi.mocked(prisma.license.findFirst).mockResolvedValue(mockLicense as never)
      const futureExpiry = new Date(mockLicense.expiresAt!)
      futureExpiry.setMonth(futureExpiry.getMonth() + 12)
      vi.mocked(prisma.license.update).mockResolvedValue({ ...mockLicense, expiresAt: futureExpiry } as never)

      const result = await renewKey('clan-id', 'lic-id', 12)

      expect(result.expiresAt).toBeInstanceOf(Date)
    })
  })
})
