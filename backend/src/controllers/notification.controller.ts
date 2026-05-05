import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/response';

export const NotificationController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    const notifications = await NotificationService.getAll();
    sendSuccess(res, notifications);
  },

  async markRead(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const notification = await NotificationService.markRead(id);
    sendSuccess(res, notification);
  },
};
