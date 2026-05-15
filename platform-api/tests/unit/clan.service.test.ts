import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    clan: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-v4'),
}))

import { prisma } from '../../src/lib/prisma'
import { listClans, createClan, getClanById, updateClan, updateClanStatus, deleteClan } from '../../src/services/clan.service'

const mockClan = {
  id: 'clan-id-1',
  name: 'Họ Nguyễn',
  code: 'ho-nguyen',
  licenseType: 'SUBSCRIPTION',
  status: 'ACTIVE',
  subdomain: 'ho-nguyen.giaphaho.vn',
  contactName: null,
  contactEmail: null,
  contactPhone: null,
  address: null,
  notes: null,
  licenses: [],
  theme: null,
  activityLogs: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('clan.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listClans', () => {
    it('returns paginated clans', async () => {
      vi.mocked(prisma.clan.findMany).mockResolvedValue([mockClan])
      vi.mocked(prisma.clan.count).mockResolvedValue(1)

      const result = await listClans({ page: 1 })

      expect(result.clans).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.totalPages).toBe(1)
    })

    it('applies status filter', async () => {
      vi.mocked(prisma.clan.findMany).mockResolvedValue([])
      vi.mocked(prisma.clan.count).mockResolvedValue(0)

      await listClans({ status: 'ACTIVE' })

      expect(prisma.clan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'ACTIVE' }) })
      )
    })
  })

  describe('createClan', () => {
    it('creates clan with auto-generated license key', async () => {
      vi.mocked(prisma.clan.create).mockResolvedValue({ ...mockClan, licenses: [{ id: 'l1', key: 'mock-uuid-v4' }] } as never)

      const result = await createClan({
        name: 'Họ Nguyễn',
        code: 'ho-nguyen',
        licenseType: 'SUBSCRIPTION',
      })

      expect(result.licenseKey).toBe('mock-uuid-v4')
    })
  })

  describe('getClanById', () => {
    it('returns clan with relations', async () => {
      vi.mocked(prisma.clan.findUnique).mockResolvedValue(mockClan as never)

      const result = await getClanById('clan-id-1')

      expect(result.id).toBe('clan-id-1')
    })

    it('throws CLAN_NOT_FOUND when not found', async () => {
      vi.mocked(prisma.clan.findUnique).mockResolvedValue(null)

      await expect(getClanById('nonexistent')).rejects.toThrow('CLAN_NOT_FOUND')
    })
  })

  describe('updateClanStatus', () => {
    it('updates status', async () => {
      vi.mocked(prisma.clan.findUnique).mockResolvedValue(mockClan)
      vi.mocked(prisma.clan.update).mockResolvedValue({ ...mockClan, status: 'SUSPENDED' })

      const result = await updateClanStatus('clan-id-1', 'SUSPENDED')

      expect(result.status).toBe('SUSPENDED')
    })
  })

  describe('deleteClan', () => {
    it('throws CLAN_NOT_FOUND for nonexistent clan', async () => {
      vi.mocked(prisma.clan.findUnique).mockResolvedValue(null)

      await expect(deleteClan('nonexistent')).rejects.toThrow('CLAN_NOT_FOUND')
    })
  })
})
