import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: string;
  username: string;
  role: string;
  chiId: string | null;
}

const secret = (): string => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set');
  return s;
};

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, secret(), { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, secret()) as JwtPayload;
};
