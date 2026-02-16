import { SCHEMA } from './schema.js';
import { seedDatabase } from './seed.js';

// ============================================================================
// Dual-mode DB layer:
//   - If TURSO_URL is set → use @libsql/client (Vercel / production)
//   - Otherwise → use better-sqlite3 (local development)
// Both expose the same DbClient interface.
// ============================================================================

export interface DbRow {
  [key: string]: any;
}

export interface DbResult {
  rows: DbRow[];
}

export interface DbClient {
  execute(sqlOrObj: string | { sql: string; args?: any[] }): Promise<DbResult>;
}

let client: DbClient | null = null;
let initialized = false;

// Detect serverless environment (Vercel sets VERCEL=1)
const isServerless = !!process.env.VERCEL;

async function createTursoClient(): Promise<DbClient> {
  const { createClient } = await import('@libsql/client');
  return createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

async function createLibsqlInMemoryClient(): Promise<DbClient> {
  // Use @libsql/client with in-memory DB for serverless without Turso configured.
  // Data persists across warm invocations but resets on cold starts — fine for demo.
  const { createClient } = await import('@libsql/client');
  return createClient({ url: ':memory:' });
}

async function createLocalClient(): Promise<DbClient> {
  const Database = (await import('better-sqlite3')).default;
  const path = await import('path');
  const dbPath = path.join(process.cwd(), 'server', 'db', 'aba.db');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Wrap synchronous better-sqlite3 in our async DbClient interface
  return {
    async execute(sqlOrObj: string | { sql: string; args?: any[] }): Promise<DbResult> {
      const sql = typeof sqlOrObj === 'string' ? sqlOrObj : sqlOrObj.sql;
      const args = typeof sqlOrObj === 'string' ? [] : (sqlOrObj.args || []);
      const isSelect = sql.trimStart().toUpperCase().startsWith('SELECT');
      if (isSelect) {
        const rows = db.prepare(sql).all(...args);
        return { rows };
      } else {
        db.prepare(sql).run(...args);
        return { rows: [] };
      }
    },
  };
}

export function getDb(): DbClient {
  if (!client) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return client;
}

export async function initDb(): Promise<DbClient> {
  if (!client) {
    if (process.env.TURSO_URL) {
      console.log('🌐 Using Turso (remote) database');
      client = await createTursoClient();
    } else if (isServerless) {
      console.log('🧪 Using in-memory libSQL (serverless demo mode)');
      client = await createLibsqlInMemoryClient();
    } else {
      console.log('💾 Using local SQLite database');
      client = await createLocalClient();
    }
  }

  if (!initialized) {
    // Execute each CREATE TABLE statement individually
    const statements = SCHEMA.split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const sql of statements) {
      await client.execute(sql);
    }
    await seedDatabase(client);
    initialized = true;
  }

  return client;
}
