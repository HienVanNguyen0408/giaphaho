import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    license: {
      findMany: vi.fn(),
    },
    clan: {
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({}),
    })),
  },
}))

import { prisma } from '../../src/lib/prisma'
import { createNotification, listNotifications, markRead, markAllRead } from '../../src/services/notification.service'

describe('notification.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createNotification', () => {
    it('creates a notification in the database', async () => {
      const mockNotification = {
        id: 'notif-id',
        clanId: 'clan-id',
        type: 'LICENSE_EXPIRY_WARNING',
        message: 'License sắp hết hạn',
        isRead: false,
        sentEmail: false,
        createdAt: new Date(),
      }
      vi.mocked(prisma.notification.create).mockResolvedValue(mockNotification)

      const result = await createNotification({
        clanId: 'clan-id',
        type: 'LICENSE_EXPIRY_WARNING',
        message: 'License sắp hết hạn',
      })

      expect(result.id).toBe('notif-id')
      expect(result.type).toBe('LICENSE_EXPIRY_WARNING')
    })
  })

  describe('listNotifications', () => {
    it('returns notifications ordered by read status then date', async () => {
      const mockNotifications = [
        { id: '1', isRead: false, createdAt: new Date() },
        { id: '2', isRead: true, createdAt: new Date() },
      ]
      vi.mocked(prisma.notification.findMany).mockResolvedValue(mockNotifications as never)

      const result = await listNotifications()

      expect(result).toHaveLength(2)
      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
        })
      )
    })
  })

  describe('markRead', () => {
    it('marks a notification as read', async () => {
      vi.mocked(prisma.notification.update).mockResolvedValue({ id: 'notif-id', isRead: true } as never)

      const result = await markRead('notif-id')

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-id' },
        data: { isRead: true },
      })
    })
  })

  describe('markAllRead', () => {
    it('marks all unread notifications as read', async () => {
      vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 3 })

      await markAllRead()

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { isRead: false },
        data: { isRead: true },
      })
    })
  })
})
