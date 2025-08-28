// server/types/express.d.ts
import 'express';

declare global {
  namespace Express {
    // what you store in req.user after JWT verify
    interface UserPayload {
      id: string;
      role: string;
      email?: string;
      username?: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};