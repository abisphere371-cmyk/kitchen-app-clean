// server/scripts/migrate.ts
import { pool } from '../db.js';

export async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('Starting database migrations...');
    await client.query('BEGIN');

    // --- extensions ---
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // --- helper sequence + function for order numbers (ORD-YYYYMMDD-XXXX) ---
    await client.query(`CREATE SEQUENCE IF NOT EXISTS order_number_seq;`);
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_proc WHERE proname = 'generate_order_number'
        ) THEN
          CREATE OR REPLACE FUNCTION generate_order_number()
          RETURNS text AS $fn$
          DECLARE
            n bigint := nextval('order_number_seq');
          BEGIN
            RETURN 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(n::text, 4, '0');
          END
          $fn$ LANGUAGE plpgsql;
        END IF;
      END
      $$;
    `);

    // --- core tables ---

    // users (auth)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email         text UNIQUE NOT NULL,
        password_hash text NOT NULL,
        role          text NOT NULL,           // don't over-constrain; app uses many roles
        name          text,
        active        boolean NOT NULL DEFAULT true,
        created_at    timestamptz NOT NULL DEFAULT now(),
        updated_at    timestamptz NOT NULL DEFAULT now()
      );
    `);

    // suppliers
    await client.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name        text NOT NULL,
        email       text,
        phone       text,
        address     text,
        notes       text,
        is_active   boolean NOT NULL DEFAULT true,
        created_at  timestamptz NOT NULL DEFAULT now(),
        updated_at  timestamptz NOT NULL DEFAULT now()
      );
    `);

    // customers
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name         text NOT NULL,
        email        text,
        phone        text,
        addresses    jsonb,
        preferences  jsonb,
        created_at   timestamptz NOT NULL DEFAULT now(),
        updated_at   timestamptz NOT NULL DEFAULT now()
      );
    `);

    // inventory_items (this is where the app currently expects `quantity`)
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name           text NOT NULL,
        sku            text,
        category       text,
        unit           text,
        quantity       integer NOT NULL DEFAULT 0,      // <- app expects this
        min_stock      integer NOT NULL DEFAULT 0,
        max_stock      integer NOT NULL DEFAULT 0,
        cost_per_unit  numeric(12,2) NOT NULL DEFAULT 0,
        last_restocked timestamptz,
        expiry_date    date,
        supplier_id    uuid REFERENCES suppliers(id) ON DELETE SET NULL,
        location       text,
        created_at     timestamptz NOT NULL DEFAULT now(),
        updated_at     timestamptz NOT NULL DEFAULT now()
      );
    `);

    // stock_movements (references inventory_items)
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        item_id       uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
        delta         integer NOT NULL,                // +restock / -consumption
        movement_type text,                            // e.g. 'restock','use','waste','adjustment'
        reference     text,                            // free-form reference (order, note, etc.)
        created_by    uuid REFERENCES users(id),
        created_at    timestamptz NOT NULL DEFAULT now()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON stock_movements(item_id);`);

    // recipes (kept simple; ingredients stored as JSON mapping item_id->qty)
    await client.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name         text NOT NULL,
        description  text,
        ingredients  jsonb,         // [{ item_id, quantity, unit }]
        instructions text,
        cost         numeric(12,2),
        price        numeric(12,2),
        created_at   timestamptz NOT NULL DEFAULT now(),
        updated_at   timestamptz NOT NULL DEFAULT now()
      );
    `);

    // orders + order_items
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number  text UNIQUE,                     // app calls generate_order_number()
        status        text NOT NULL DEFAULT 'pending',
        customer_id   uuid REFERENCES customers(id) ON DELETE SET NULL,
        total_amount  numeric(12,2) NOT NULL DEFAULT 0,
        notes         text,
        created_at    timestamptz NOT NULL DEFAULT now(),
        updated_at    timestamptz NOT NULL DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        recipe_id   uuid REFERENCES recipes(id) ON DELETE SET NULL,
        quantity    integer NOT NULL DEFAULT 1,
        unit_price  numeric(12,2) NOT NULL DEFAULT 0,
        created_at  timestamptz NOT NULL DEFAULT now()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);`);

    // purchase_orders (optional but present in routes)
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        supplier_id  uuid REFERENCES suppliers(id) ON DELETE SET NULL,
        order_date   date NOT NULL DEFAULT CURRENT_DATE,
        status       text NOT NULL DEFAULT 'open',
        items        jsonb,                            // [{ item_id, quantity, cost_per_unit }]
        notes        text,
        created_at   timestamptz NOT NULL DEFAULT now(),
        updated_at   timestamptz NOT NULL DEFAULT now()
      );
    `);

    // delivery_confirmations (referenced by routes)
    await client.query(`
      CREATE TABLE IF NOT EXISTS delivery_confirmations (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id      uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        delivered_at  timestamptz NOT NULL DEFAULT now(),
        notes         text,
        confirmed_by  uuid REFERENCES users(id),
        created_at    timestamptz NOT NULL DEFAULT now()
      );
    `);

    // --- add-any-missing columns to match the code (idempotent) ---

    // orders.order_number
    await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number text UNIQUE;`);
    // inventory_items.quantity (your error)
    await client.query(`ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 0;`);
    await client.query(`ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS cost_per_unit numeric(12,2) NOT NULL DEFAULT 0;`);
    await client.query(`ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS min_stock integer NOT NULL DEFAULT 0;`);
    await client.query(`ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS max_stock integer NOT NULL DEFAULT 0;`);
    await client.query(`ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS last_restocked timestamptz;`);
    await client.query(`ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS expiry_date date;`);

    // users.active (front-end expects isActive from active)
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name   text;`);

    // --- seed admin user (idempotent) ---
    await client.query(`
      INSERT INTO users (email, password_hash, role, name, active)
      VALUES (
        'admin@example.com',
        // bcrypt hash for 'admin123' (cost 10). Replace if you changed it.
        '$2a$10$Qb3Tx3vRzL8a3w3w3d7bXu2r4Ck0e8J5y3mV6dQ61Q0g7Q1yR4l.S',
        'admin',
        'Admin',
        true
      )
      ON CONFLICT (email) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('Migrations complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration process failed:', err);
    throw err;
  } finally {
    client.release();
  }
}
