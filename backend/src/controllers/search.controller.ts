import { Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import { sendSuccess } from '../utils/response';

export const SearchController = {
  async search(req: Request, res: Response): Promise<void> {
    const q = String(req.query.q ?? '').trim();
    const result = await SearchService.search(q);
    sendSuccess(res, result);
  },
};
