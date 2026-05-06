import { Request, Response } from 'express';
import { MemberService } from '../services/member.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export const MemberController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    const members = await MemberService.getAll();
    sendSuccess(res, members);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params['id']);
    try {
      const member = await MemberService.getById(id);
      sendSuccess(res, member);
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
    const data = req.body as {
      fullName: string;
      avatar?: string;
      birthYear?: number;
      deathYear?: number;
      gender?: string;
      bio?: string;
      achievements?: string[];
      parentId?: string;
      chiId?: string;
    };
    try {
      const member = await MemberService.create(data, req.user?.role, req.user?.chiId);
      sendCreated(res, member);
    } catch (err) {
      const error = err as Error & { statusCode?: number };
      if (error.statusCode === 403) {
        sendError(res, error.message, 403);
      } else {
        throw err;
      }
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params['id']);
    const data = req.body as {
      fullName?: string;
      avatar?: string;
      birthYear?: number;
      deathYear?: number;
      gender?: string;
      bio?: string;
      achievements?: string[];
      parentId?: string;
      chiId?: string;
    };
    const callerRole = req.user?.role ?? '';
    const callerChiId = req.user?.chiId ?? null;
    try {
      const member = await MemberService.update(id, data, callerRole, callerChiId);
      sendSuccess(res, member);
    } catch (err) {
      const error = err as Error & { statusCode?: number };
      if (error.statusCode === 403) {
        sendError(res, error.message, 403);
      } else if (error.statusCode === 404) {
        sendError(res, error.message, 404);
      } else {
        throw err;
      }
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params['id']);
    await MemberService.delete(id);
    res.status(204).send();
  },

  async recalculateStats(_req: Request, res: Response): Promise<void> {
    await MemberService.recalculateAllStats();
    sendSuccess(res, null, 'Đã tính lại số liệu toàn bộ gia phả');
  },
};
