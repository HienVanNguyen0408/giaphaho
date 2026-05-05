import prisma from '../lib/prisma';
import { ActivityLog } from '@prisma/client';

type ActivityLogWithUser = ActivityLog & {
  user: { id: string; username: string; role: string };
};

export const ActivityLogService = {
  async getAll(page: number, limit: number): Promise<{
    items: ActivityLogWithUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [items, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, username: true, role: true },
          },
        },
      }),
      prisma.activityLog.count(),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { items: items as ActivityLogWithUser[], total, page, totalPages };
  },
};
