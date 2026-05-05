import prisma from '../lib/prisma';

export const DashboardService = {
  async getStats() {
    const [totalMembers, totalNews, totalVideos, unreadNotifications, recentLogs] = await Promise.all([
      prisma.member.count(),
      prisma.news.count(),
      prisma.video.count(),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: { id: true, username: true, role: true },
          },
        },
      }),
    ]);

    return { totalMembers, totalNews, totalVideos, unreadNotifications, recentLogs };
  },
};
