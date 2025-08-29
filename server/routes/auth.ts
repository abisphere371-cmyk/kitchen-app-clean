import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { signJwt, comparePassword, requireAuth } from '../auth.js';
import type { UserPayload } from '../auth.js';

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(1).optional(), // we'll treat username as email for now
  password: z.string().min(1),
});

router.post('/login', async (req: any, res: any) => {
  try {
    const body = credentialsSchema.parse(req.body);
    const email = (body.email ?? body.username)?.toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const result = await query(
      `SELECT id, email, password_hash, role, name
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const ok = await comparePassword(body.password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signJwt({ id: user.id, email: user.email, role: user.role, name: user.name ?? null });

    // Set the auth cookie
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',      // same-origin app: 'lax' is fine; if cross-origin use 'none'
      secure: process.env.NODE_ENV === 'production',         // Railway is HTTPS; requires app.set('trust proxy', 1)
      maxAge: 1000 * 60 * 60 * 8, // 8h
    });

    // minimal user shape used by the frontend
    const safeUser = { id: user.id, email: user.email, role: user.role, name: user.name ?? null };
    return res.json({ user: safeUser });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req: any, res: any) => {
  const user = req.user as UserPayload;
  return res.json({ user });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully' });
});

export default router;