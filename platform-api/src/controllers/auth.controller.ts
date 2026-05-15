import { Request, Response } from 'express'
import { login, getMe } from '../services/auth.service'
import { sendSuccess, sendError } from '../utils/response'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    sendError(res, 'VALIDATION_ERROR', 'Invalid input', 400, parsed.error.errors)
    return
  }

  try {
    const { token, admin } = await login(parsed.data.email, parsed.data.password)
    res.cookie('platform_token', token, COOKIE_OPTIONS)
    sendSuccess(res, { admin })
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
      sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401)
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Login failed', 500)
    }
  }
}

export async function logoutHandler(_req: Request, res: Response): Promise<void> {
  res.clearCookie('platform_token', { httpOnly: true, sameSite: 'lax' })
  sendSuccess(res, { message: 'Logged out successfully' })
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  try {
    const admin = await getMe(req.admin!.adminId)
    sendSuccess(res, { admin })
  } catch (err) {
    if (err instanceof Error && err.message === 'ADMIN_NOT_FOUND') {
      sendError(res, 'ADMIN_NOT_FOUND', 'Admin not found', 404)
    } else {
      sendError(res, 'INTERNAL_ERROR', 'Failed to fetch admin', 500)
    }
  }
}
