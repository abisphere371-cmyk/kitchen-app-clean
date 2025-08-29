import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';

export type UserPayload = {
  id: string;
  email: string;
  role: string;
  name?: string;
};

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export function signJwt(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export const verifyJwt = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined);
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
};