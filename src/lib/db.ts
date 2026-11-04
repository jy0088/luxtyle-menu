// Postgres access for the staff tools. Works with Vercel's Neon/Postgres integration
// (POSTGRES_URL / DATABASE_URL injected by Vercel). Without a URL every call throws
// and the API answers 503 → pages fall back to on-device storage.
import { Pool } from 'pg';

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

export function dbUrl() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || '';
}
export function hasDb() { return !!dbUrl(); }

function getPool() {
  if (!pool) {
    const url = dbUrl();
    if (!url) throw new Error('no database url');
    pool = new Pool({ connectionString: url, max: 3, ssl: url.includes('localhost') ? undefined : { rejectUnauthorized: false } });
  }
  return pool;
}

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const p = getPool();
      await p.query(`
        create table if not exists staff_events (
          id text primary key,
          type text not null,
          store text,
          vendor text,
          who text,
          status text,
          ts bigint not null,
          updated bigint not null,
          data jsonb not null
        );
        create index if not exists staff_events_type_ts on staff_events (type, ts desc);
        create table if not exists staff_stock (
          item_id text primary key,
          on_hand numeric not null,
          counted_at bigint not null,
          by text
        );
      `);
    })().catch(e => { schemaReady = null; throw e; });
  }
  return schemaReady;
}

export async function q<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
  await ensureSchema();
  const r = await getPool().query(text, params);
  return r.rows as T[];
}
