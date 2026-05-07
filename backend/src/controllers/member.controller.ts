import { Request, Response } from 'express';
import { MemberService, getJob } from '../services/member.service';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export const MemberController = {
  async getAll(req: Request, res: Response): Promise<void> {
    if (req.query['page'] !== undefined) {
      const page = Math.max(1, Number(req.query['page']) || 1);
      const limit = Math.max(1, Math.min(100, Number(req.query['limit']) || 12));
      const name = req.query['name'] ? String(req.query['name']) : undefined;
      const result = await MemberService.getPage(page, limit, name);
      sendSuccess(res, result);
    } else {
      const members = await MemberService.getAll();
      sendSuccess(res, members);
    }
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
      birthDate?: string;
      deathYear?: number;
      deathDate?: string;
      gender?: string;
      bio?: string;
      achievements?: string[];
      parentId?: string;
      chiId?: string;
      residence?: string;
      nationalId?: string;
      phone?: string;
      email?: string;
      bankAccount?: string;
      burialPlace?: string;
      fieldConfig?: Record<string, boolean>;
      spouses?: string[];
      motherName?: string;
      contributions?: string[];
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
      birthDate?: string;
      deathYear?: number;
      deathDate?: string;
      gender?: string;
      bio?: string;
      achievements?: string[];
      parentId?: string;
      chiId?: string;
      residence?: string;
      nationalId?: string;
      phone?: string;
      email?: string;
      bankAccount?: string;
      burialPlace?: string;
      fieldConfig?: Record<string, boolean>;
      spouses?: string[];
      motherName?: string;
      contributions?: string[];
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
    const jobId = MemberService.startRecalculation();
    sendSuccess(res, { jobId }, 'Đã bắt đầu tính lại số liệu');
  },

  async recalculateStatsEvents(req: Request, res: Response): Promise<void> {
    const jobId = req.query['jobId'] as string | undefined;
    if (!jobId) {
      sendError(res, 'Thiếu jobId', 400);
      return;
    }

    const job = getJob(jobId);
    if (!job) {
      sendError(res, 'Không tìm thấy job', 404);
      return;
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Job already finished — send terminal event and close immediately
    if (job.status === 'done') {
      send('done', job.result);
      res.end();
      return;
    }
    if (job.status === 'error') {
      send('error', { message: job.error });
      res.end();
      return;
    }

    // Subscribe to live events
    const onProgress = (data: unknown) => send('progress', data);
    const onDone = (data: unknown) => { send('done', data); res.end(); };
    const onError = (data: unknown) => { send('error', data); res.end(); };

    job.emitter.on('progress', onProgress);
    job.emitter.on('done', onDone);
    job.emitter.on('error', onError);

    // Heartbeat — keeps the connection alive through proxies
    const heartbeat = setInterval(() => {
      if (!res.writableEnded) res.write(': heartbeat\n\n');
    }, 15_000);

    req.on('close', () => {
      clearInterval(heartbeat);
      job.emitter.off('progress', onProgress);
      job.emitter.off('done', onDone);
      job.emitter.off('error', onError);
    });
  },
};
