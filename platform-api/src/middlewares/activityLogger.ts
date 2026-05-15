import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function activityLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!MUTATING_METHODS.has(req.method)) {
    next()
    return
  }

  const originalJson = res.json.bind(res)

  res.json = function (body: unknown) {
    if (res.statusCode < 400 && req.admin) {
      const action = deriveAction(req)
      const clanId = extractClanId(req)

      prisma.activityLog
        .create({
          data: {
            adminId: req.admin.adminId,
            clanId: clanId ?? undefined,
            action,
            detail: { method: req.method, path: req.path, body: req.body } as never,
          },
        })
        .catch(() => {})
    }

    return originalJson(body)
  }

  next()
}

function deriveAction(req: Request): string {
  const method = req.method
  const path = req.path

  if (path.includes('/license/generate')) return 'GENERATE_LICENSE'
  if (path.includes('/revoke')) return 'REVOKE_LICENSE'
  if (path.includes('/renew')) return 'RENEW_LICENSE'
  if (path.includes('/download/generate')) return 'GENERATE_DOWNLOAD'
  if (path.includes('/theme')) return 'UPDATE_THEME'
  if (path.includes('/status')) return 'UPDATE_CLAN_STATUS'
  if (method === 'POST' && path.includes('/clans')) return 'CREATE_CLAN'
  if (method === 'PATCH' && path.includes('/clans')) return 'UPDATE_CLAN'
  if (method === 'DELETE' && path.includes('/clans')) return 'DELETE_CLAN'
  return `${method}_${path.replace(/\//g, '_').toUpperCase()}`
}

function extractClanId(req: Request): string | null {
  return (req.params.id ?? req.params.clanId) ?? null
}
