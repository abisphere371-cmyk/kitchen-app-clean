// server/db.ts
import pg, { QueryResult, QueryResultRow } from 'pg';

const {
  DATABASE_URL,
  PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE,
} = process.env;

const isExternalUrl = !!DATABASE_URL && /^postgres(ql)?:\/\//i.test(DATABASE_URL);

export const pool = new pg.Pool(
  DATABASE_URL
    ? {
        connectionString: DATABASE_URL,
        ssl: isExternalUrl ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host: PGHOST,
        port: PGPORT ? Number(PGPORT) : 5432,
        user: PGUSER,
        password: PGPASSWORD,
        database: PGDATABASE,
        ssl: (PGHOST && !/\.internal$/.test(PGHOST)) ? { rejectUnauthorized: false } : undefined,
      }
);

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}
