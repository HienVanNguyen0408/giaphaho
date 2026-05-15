import { Request, Response, NextFunction } from 'express'
import { sendError } from '../utils/response'

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const admin = req.admin

    if (!admin) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', 401)
      return
    }

    if (!roles.includes(admin.role)) {
      sendError(res, 'FORBIDDEN', 'Insufficient permissions', 403)
      return
    }

    next()
  }
}
