import Database from 'better-sqlite3';
import path from 'path';
import { SCHEMA } from './schema.js';
import { seedDatabase } from './seed.js';

const DB_PATH = path.join(process.cwd(), 'server', 'db', 'aba.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(SCHEMA);
    seedDatabase(db);
  }
  return db;
}
