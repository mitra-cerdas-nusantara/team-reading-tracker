import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(path.join(dbDir, 'reading_tracker.db'));

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_mode TEXT NOT NULL DEFAULT 'minutes', -- 'minutes' or 'pages'
    target_value INTEGER
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reading_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD
    value INTEGER NOT NULL,
    notes TEXT,
    FOREIGN KEY(member_id) REFERENCES members(id)
  );

  -- Ensure one log per member per day
  CREATE UNIQUE INDEX IF NOT EXISTS idx_member_date ON reading_logs(member_id, date);
`);

// Migration: Add activity_name to settings if it doesn't exist
try {
  const tableInfo = db.pragma('table_info(settings)') as any[];
  if (!tableInfo.some(col => col.name === 'activity_name')) {
    db.exec("ALTER TABLE settings ADD COLUMN activity_name TEXT DEFAULT 'Reading Tracker'");
  }
} catch (e) {
  console.error("Migration error:", e);
}

// Insert default settings if empty
const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
if (settingsCount.count === 0) {
  db.prepare("INSERT INTO settings (tracking_mode) VALUES ('minutes')").run();
}
