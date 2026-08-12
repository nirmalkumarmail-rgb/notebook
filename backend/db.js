const path = require('path');

function toPostgres(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS notes (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title      TEXT NOT NULL DEFAULT '',
      content    TEXT NOT NULL DEFAULT '',
      tags       TEXT NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE notes ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT FALSE;
  `).catch(console.error);

  module.exports = {
    async get(sql, ...params) {
      const { rows } = await pool.query(toPostgres(sql), params);
      return rows[0] || null;
    },
    async all(sql, ...params) {
      const { rows } = await pool.query(toPostgres(sql), params);
      return rows;
    },
    async run(sql, ...params) {
      if (sql.trim().toUpperCase().startsWith('INSERT')) {
        const { rows } = await pool.query(toPostgres(sql) + ' RETURNING id', params);
        return { lastInsertRowid: rows[0]?.id };
      }
      await pool.query(toPostgres(sql), params);
      return { lastInsertRowid: null };
    },
  };
} else {
  const Database = require('better-sqlite3');
  const db = new Database(path.join(__dirname, 'notebook.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);

  const notesCols = db.prepare('PRAGMA table_info(notes)').all().map((c) => c.name);
  if (!notesCols.includes('user_id')) db.exec('DROP TABLE IF EXISTS notes');

  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title      TEXT NOT NULL DEFAULT '',
      content    TEXT NOT NULL DEFAULT '',
      tags       TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);

  const colNames = db.prepare('PRAGMA table_info(notes)').all().map((c) => c.name);
  if (!colNames.includes('pinned')) {
    db.exec('ALTER TABLE notes ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0');
  }

  module.exports = {
    async get(sql, ...params) { return db.prepare(sql).get(...params) ?? null; },
    async all(sql, ...params) { return db.prepare(sql).all(...params); },
    async run(sql, ...params) { return db.prepare(sql).run(...params); },
  };
}
