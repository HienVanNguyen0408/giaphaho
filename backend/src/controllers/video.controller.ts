import { Request, Response } from 'express';
import { VideoService } from '../services/video.service';
import { sendSuccess, sendCreated } from '../utils/response';

export const VideoController = {
  async getList(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.max(1, parseInt(String(req.query.limit ?? '12'), 10) || 12);
    const keyword = req.query.keyword ? String(req.query.keyword).trim() : undefined;
    const result = await VideoService.getList(page, limit, keyword);
    sendSuccess(res, result);
  },

  async create(req: Request, res: Response): Promise<void> {
    const video = await VideoService.create(req.body);
    sendCreated(res, video);
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const video = await VideoService.update(id, req.body);
    sendSuccess(res, video);
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await VideoService.delete(id);
    res.status(204).send();
  },

  async reorder(req: Request, res: Response): Promise<void> {
    const { orderedIds, startIndex } = req.body as { orderedIds: string[]; startIndex?: number };
    await VideoService.reorder(orderedIds, startIndex ?? 0);
    sendSuccess(res, null, 'Reordered successfully');
  },
};
