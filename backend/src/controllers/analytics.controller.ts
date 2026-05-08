import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { sendCreated, sendSuccess } from '../utils/response';

function getClientIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim() ?? null;
  return req.ip ?? null;
}

export const AnalyticsController = {
  async track(req: Request, res: Response): Promise<void> {
    const body = req.body as {
      eventType?: string;
      path?: string;
      title?: string;
      targetType?: string;
      targetId?: string;
      visitorId?: string;
      referrer?: string;
    };

    await AnalyticsService.track({
      ...body,
      userAgent: req.get('user-agent') ?? null,
      ipAddress: getClientIp(req),
    });

    sendCreated(res, null, 'Tracked');
  },

  async summary(req: Request, res: Response): Promise<void> {
    const days = Math.min(30, Math.max(1, parseInt(String(req.query.days ?? '7'), 10) || 7));
    const summary = await AnalyticsService.getSummary(days);
    sendSuccess(res, summary);
  },
};
