import { Request, Response } from 'express';
import { ActivityLogService } from '../services/activity-log.service';
import { sendSuccess } from '../utils/response';

export const ActivityLogController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20);
    const result = await ActivityLogService.getAll(page, limit);
    sendSuccess(res, result);
  },
};
