import prisma from '../lib/prisma';

export interface TrackAnalyticsInput {
  eventType?: string;
  path?: string;
  title?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  visitorId?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function clampText(value: string | null | undefined, max: number): string | null {
  if (!value) return null;
  return value.slice(0, max);
}

function normalizePath(path: string | undefined): string {
  const raw = path?.trim() || '/';
  return raw.startsWith('/') ? raw.slice(0, 300) : `/${raw.slice(0, 299)}`;
}

export const AnalyticsService = {
  async track(input: TrackAnalyticsInput) {
    const path = normalizePath(input.path);
    const eventType = clampText(input.eventType, 40) ?? 'page_view';

    return prisma.analyticsEvent.create({
      data: {
        eventType,
        path,
        title: clampText(input.title, 180),
        targetType: clampText(input.targetType, 40),
        targetId: clampText(input.targetId, 120),
        visitorId: clampText(input.visitorId, 120),
        referrer: clampText(input.referrer, 300),
        userAgent: clampText(input.userAgent, 300),
        ipAddress: clampText(input.ipAddress, 80),
      },
    });
  },

  async getSummary(days = 7) {
    const now = new Date();
    const today = startOfDay(now);
    const fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() - Math.max(0, days - 1));

    const [totalViews, todayViews, newsViews, videoViews, recentEvents, topPages, visitorEvents, rangeEvents] =
      await Promise.all([
        prisma.analyticsEvent.count({ where: { eventType: 'page_view' } }),
        prisma.analyticsEvent.count({ where: { eventType: 'page_view', createdAt: { gte: today } } }),
        prisma.analyticsEvent.count({
          where: {
            eventType: 'page_view',
            OR: [{ targetType: 'news' }, { path: { startsWith: '/tin-tuc/' } }],
          },
        }),
        prisma.analyticsEvent.count({
          where: {
            OR: [
              { eventType: 'video_view' },
              { eventType: 'page_view', targetType: 'video' },
              { eventType: 'page_view', path: { startsWith: '/video' } },
            ],
          },
        }),
        prisma.analyticsEvent.findMany({
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
        prisma.analyticsEvent.groupBy({
          by: ['path'],
          where: { eventType: 'page_view', createdAt: { gte: fromDate } },
          _count: { _all: true },
          orderBy: { _count: { path: 'desc' } },
          take: 10,
        }),
        prisma.analyticsEvent.findMany({
          where: { createdAt: { gte: fromDate }, visitorId: { not: null } },
          select: { visitorId: true },
        }),
        prisma.analyticsEvent.findMany({
          where: { eventType: 'page_view', createdAt: { gte: fromDate } },
          select: { createdAt: true },
        }),
      ]);

    const dailyMap = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(fromDate);
      d.setDate(fromDate.getDate() + i);
      dailyMap.set(d.toISOString().slice(0, 10), 0);
    }
    for (const event of rangeEvents) {
      const key = event.createdAt.toISOString().slice(0, 10);
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
    }

    const uniqueVisitors = new Set(visitorEvents.map((event) => event.visitorId).filter(Boolean)).size;

    return {
      totalViews,
      todayViews,
      newsViews,
      videoViews,
      uniqueVisitors,
      topPages: topPages.map((page) => ({
        path: page.path,
        views: page._count._all,
      })),
      dailyViews: Array.from(dailyMap.entries()).map(([date, views]) => ({ date, views })),
      recentEvents,
    };
  },
};
