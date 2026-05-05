import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';

export const AuthController = {
  async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body as { username: string; password: string };
    try {
      const user = await AuthService.login(username, password);
      const token = signToken({
        id: user.id,
        username: user.username,
        role: user.role,
        chiId: user.chiId,
      });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      sendSuccess(res, user);
    } catch (err) {
      const error = err as Error & { statusCode?: number };
      if (error.statusCode === 401) {
        sendError(res, error.message, 401);
      } else {
        throw err;
      }
    }
  },

  logout(_req: Request, res: Response): void {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    sendSuccess(res, null, 'Logged out');
  },

  me(req: Request, res: Response): void {
    sendSuccess(res, req.user);
  },
};
