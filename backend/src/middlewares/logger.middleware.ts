import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const extractTarget = (url: string): { target: string; targetId?: string } => {
  const parts = url.replace('/api/', '').split('/');
  const target = parts[0] ?? 'unknown';
  const targetId = parts[1] && !parts[1].includes('?') ? parts[1] : undefined;
  return { target, targetId };
};

export const activityLogger = (req: Request, res: Response, next: NextFunction): void => {
  if (!MUTATION_METHODS.has(req.method)) {
    next();
    return;
  }

  res.on('finish', () => {
    if (!req.user || res.statusCode >= 400) return;

    const { target, targetId } = extractTarget(req.path);
    const detail = JSON.stringify(req.body ?? {}).slice(0, 200);

    prisma.activityLog
      .create({
        data: {
          userId: req.user.id,
          action: req.method,
          target,
          targetId,
          detail,
        },
      })
      .catch((err: unknown) => {
        console.error('ActivityLog write failed:', err);
      });
  });

  next();
};
