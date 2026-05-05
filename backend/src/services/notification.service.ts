import prisma from '../lib/prisma';
import { Notification } from '@prisma/client';

export const NotificationService = {
  async getAll(): Promise<Notification[]> {
    return prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async markRead(id: string): Promise<Notification> {
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  },
};
