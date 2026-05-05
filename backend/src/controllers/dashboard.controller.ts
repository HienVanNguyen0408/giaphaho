import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

export const DashboardController = {
  async getStats(_req: Request, res: Response): Promise<void> {
    const stats = await DashboardService.getStats();
    sendSuccess(res, stats);
  },
};
