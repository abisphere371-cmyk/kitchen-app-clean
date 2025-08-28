import { Pool } from 'pg';

const isProd = process.env.NODE_ENV === 'production';
const url = process.env.DATABASE_URL ?? '';
const isRailwayInternal = url.includes('.railway.internal');

export const pool = new Pool({
  connectionString: url,
  ssl: isProd ? (isRailwayInternal ? false : { rejectUnauthorized: false }) : false,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const testConnection = async () => {
  const r = await pool.query('SELECT 1');
  if (r.rowCount !== 1) throw new Error('DB test failed');
};