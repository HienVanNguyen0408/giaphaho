import prisma from '../lib/prisma';
import { comparePassword } from '../utils/bcrypt';

export const AuthService = {
  async login(username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      const error = new Error('Invalid credentials');
      (error as Error & { statusCode: number }).statusCode = 401;
      throw error;
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      const error = new Error('Invalid credentials');
      (error as Error & { statusCode: number }).statusCode = 401;
      throw error;
    }
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      chiId: user.chiId,
    };
  },
};
