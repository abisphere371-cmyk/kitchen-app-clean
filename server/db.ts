// server/db.ts
import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Typed query helper that works with pg types
export async function query(text: string, params: any[] = []) {
  return pool.query(text, params);
}
