import { Request, Response } from 'express';
import { SectionService } from '../services/section.service';
import { sendSuccess, sendCreated } from '../utils/response';

export const SectionController = {
  async getList(req: Request, res: Response): Promise<void> {
    const sections =
      req.query.all === 'true'
        ? await SectionService.getAll()
        : await SectionService.getActiveOrdered();
    sendSuccess(res, sections);
  },

  async create(req: Request, res: Response): Promise<void> {
    const section = await SectionService.create(req.body);
    sendCreated(res, section);
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const section = await SectionService.update(id, req.body);
    sendSuccess(res, section);
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await SectionService.delete(id);
    res.status(204).send();
  },

  async toggle(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const result = await SectionService.toggle(id);
    sendSuccess(res, result);
  },
};
