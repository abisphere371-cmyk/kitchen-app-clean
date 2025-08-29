import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from "express";

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

function getToken(req: Request): string | null {
  const hdr = req.headers.authorization;
  if (hdr?.startsWith("Bearer ")) return hdr.slice(7);

  // read from cookies (support old names too)
  const c = req.cookies || {};
  return (
    c["auth_token"] ||
    c["token"] ||
    c["auth"] ||
    null
  );
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    req.user = payload;               // make available to routes
    return next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
};