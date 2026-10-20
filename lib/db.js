import pg from 'pg';
import { env } from './env.js';
import { schemaStatements } from './schema.js';

const { Pool } = pg;

let pool = null;
let schemaReady = null;
let injectedPool = null;

// Allows tests to swap in an in-memory Postgres implementation.
export function usePool(instance) {
  injectedPool = instance;
  pool = null;
  schemaReady = null;
}

export function getPool() {
  if (injectedPool) return injectedPool;
  if (!env.databaseUrl) return null;
  if (pool) return pool;

  const isLocal = /localhost|127\.0\.0\.1/.test(env.databaseUrl);
  pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: env.poolMax,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  pool.on('error', (error) => {
    console.error('[db] idle client error:', error.message);
  });

  return pool;
}

export async function ensureSchema() {
  if (!getPool()) return false;
  if (!schemaReady) {
    schemaReady = (async () => {
      const client = getPool();
      for (const statement of schemaStatements()) {
        await client.query(statement);
      }
      return true;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

export async function query(text, params = []) {
  const client = getPool();
  if (!client) throw new Error('DATABASE_URL is not configured');
  const result = await client.query(text, params);
  return result.rows;
}

export async function queryOne(text, params = []) {
  const rows = await query(text, params);
  return rows[0] || null;
}

export async function ping() {
  const client = getPool();
  if (!client) return false;
  try {
    await client.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('[db] ping failed:', error.message);
    return false;
  }
}

export async function closePool() {
  if (!pool) return;
  await pool.end();
  pool = null;
  schemaReady = null;
}
