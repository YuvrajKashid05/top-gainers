import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { dbPath } from '../config/env.js';

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');
