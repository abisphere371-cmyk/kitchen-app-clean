// server/db.ts
import pg from "pg";
const { Pool } = pg;

function buildConfig() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    undefined;

  // Fallback to discrete variables if no URL is present
  const {
    POSTGRES_HOST,
    POSTGRES_PORT = "5432",
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DATABASE,
  } = process.env;

  const haveParts =
    POSTGRES_HOST && POSTGRES_USER && POSTGRES_PASSWORD && POSTGRES_DATABASE;

  const base =
    connectionString
      ? { connectionString }
      : haveParts
      ? {
          host: POSTGRES_HOST,
          port: Number(POSTGRES_PORT),
          user: POSTGRES_USER,
          password: POSTGRES_PASSWORD,
          database: POSTGRES_DATABASE,
        }
      : null;

  if (!base) {
    // Make the failure obvious in logs instead of a cryptic pg error
    throw new Error(
      "No PostgreSQL connection info. Set DATABASE_URL (recommended) or POSTGRES_HOST/PORT/USER/PASSWORD/DATABASE."
    );
  }

  // Railway Postgres requires SSL in production
  const needSSL = process.env.NODE_ENV === "production";
  return needSSL
    ? { ...base, ssl: { rejectUnauthorized: false }, keepAlive: true }
    : { ...base, keepAlive: true };
}

export const pool = new Pool(buildConfig());

// tiny helper
export async function query<T = any>(text: string, params?: any[]) {
  const res = await pool.query<T>(text, params);
  return res;
}