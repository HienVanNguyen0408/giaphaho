import { Request, Response } from 'express';
import { FooterService } from '../services/footer.service';
import { sendSuccess } from '../utils/response';

export const FooterController = {
  async get(_req: Request, res: Response): Promise<void> {
    const footer = await FooterService.get();
    sendSuccess(res, footer ?? {});
  },

  async update(req: Request, res: Response): Promise<void> {
    const footer = await FooterService.upsert(req.body);
    sendSuccess(res, footer);
  },
};
