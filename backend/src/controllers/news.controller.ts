import { Request, Response } from 'express';
import { NewsService } from '../services/news.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export const NewsController = {
  async getPinned(_req: Request, res: Response): Promise<void> {
    const pinned = await NewsService.getPinned();
    sendSuccess(res, pinned);
  },

  async getList(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.max(1, parseInt(String(req.query.limit ?? '10'), 10) || 10);
    const result = await NewsService.getList(page, limit);
    sendSuccess(res, result);
  },

  async getBySlug(req: Request, res: Response): Promise<void> {
    const slug = String(req.params.slug);
    try {
      const news = await NewsService.getBySlug(slug);
      sendSuccess(res, news);
    } catch (err) {
      const error = err as Error & { statusCode?: number };
      if (error.statusCode === 404) {
        sendError(res, error.message, 404);
      } else {
        throw err;
      }
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    const news = await NewsService.create(req.body);
    sendCreated(res, news);
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const news = await NewsService.update(id, req.body);
    sendSuccess(res, news);
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await NewsService.delete(id);
    res.status(204).send();
  },

  async togglePin(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const result = await NewsService.togglePin(id);
    sendSuccess(res, result);
  },
};
