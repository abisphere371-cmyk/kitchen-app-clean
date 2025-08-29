// server/db.ts
import pg, { QueryResult, QueryResultRow } from "pg";

const { DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;

// If DATABASE_URL is set, prefer it. Otherwise fall back to discrete PG* vars.
const useUrl = !!DATABASE_URL && /^postgres(ql)?:\/\//i.test(DATABASE_URL || "");

export const pool = new pg.Pool(
  useUrl
    ? {
        connectionString: DATABASE_URL!,
        // External providers usually require SSL but allow self-signed certs
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: PGHOST,
        port: PGPORT ? Number(PGPORT) : 5432,
        user: PGUSER,
        password: PGPASSWORD,
        database: PGDATABASE,
        // If host looks external (not *.internal), enable SSL
        ssl: PGHOST && !/\.internal$/.test(PGHOST) ? { rejectUnauthorized: false } : undefined,
      }
);

// Typed query helper that works with pg types
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

// ✅ Export the symbol your index.ts is importing
export async function testConnection(): Promise<boolean> {
  const r = await pool.query<{ ok: number }>("SELECT 1 AS ok");
  return r.rows[0]?.ok === 1;
}
