import path from "node:path";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

const dbPath = path.join(process.cwd(), "totter.db");

const client = createClient({
  url: `file:${dbPath}`,
});

// Ensure tables exist on first connection (SQLite will create the file automatically)
const initialized = client.batch(
  [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL REFERENCES children(id),
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not_yet',
      observed_date TEXT,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS word_logs (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL REFERENCES children(id),
      word TEXT NOT NULL,
      is_phrase INTEGER NOT NULL DEFAULT 0,
      observed_date TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS quiz_responses (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL REFERENCES children(id),
      question_id TEXT NOT NULL,
      answer TEXT NOT NULL,
      completed_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS recommendations (
      id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL REFERENCES children(id),
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      generated_at INTEGER NOT NULL,
      context_snapshot TEXT
    )`,
  ],
  "write",
);

initialized.catch((err) => {
  console.error("[db] Failed to initialize tables:", err);
});

export const db = drizzle(client, { schema });
