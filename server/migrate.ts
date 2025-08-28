import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { pool, query } from './db.js';

export async function runMigrations(opts: { closePool?: boolean } = {}) {
  const closePool = !!opts.closePool; // default false when called from server
  try {
    console.log('Starting database migrations...');

    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const dir = join(process.cwd(), 'server', 'migrations');
    const files = (await readdir(dir)).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      const sql = await readFile(join(dir, file), 'utf8');

      // skip if already run
      const { rows } = await query('SELECT 1 FROM migrations WHERE filename = $1', [file]);
      if (rows.length) {
        console.log(`↷ Skipping ${file} (already applied)`);
        continue;
      }

      // run file
      console.log(`↦ Applying ${file}`);
      await query(sql);

      // record
      await query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
    }

    console.log('All migrations completed successfully!');
  } catch (err) {
    console.error('Migration process failed:', err);
    throw err; // let the caller decide
  } finally {
    if (closePool) {
      await pool.end();
    }
  }
}

// If run from CLI: close the pool & set exit code
if (typeof require !== 'undefined' && require.main === module) {
  runMigrations({ closePool: true })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}