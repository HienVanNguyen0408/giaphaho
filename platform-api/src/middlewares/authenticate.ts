import { Request, Response, NextFunction } from 'express'
import { verifyToken, JwtPayload } from '../utils/jwt'
import { sendError } from '../utils/response'

declare global {
  namespace Express {
    interface Request {
      admin?: JwtPayload
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.platform_token as string | undefined

  if (!token) {
    sendError(res, 'UNAUTHORIZED', 'Authentication required', 401)
    return
  }

  try {
    const payload = verifyToken(token)
    req.admin = payload
    next()
  } catch {
    sendError(res, 'INVALID_TOKEN', 'Token is invalid or expired', 401)
  }
}
