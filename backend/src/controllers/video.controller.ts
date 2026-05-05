import { Request, Response } from 'express';
import { VideoService } from '../services/video.service';
import { sendSuccess, sendCreated } from '../utils/response';

export const VideoController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    const videos = await VideoService.getAllOrdered();
    sendSuccess(res, videos);
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
    const { orderedIds } = req.body as { orderedIds: string[] };
    await VideoService.reorder(orderedIds);
    sendSuccess(res, null, 'Reordered successfully');
  },
};
