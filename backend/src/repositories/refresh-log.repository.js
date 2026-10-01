import { db } from '../database/db.js';

const insertRefreshLog = db.prepare(`INSERT INTO refresh_logs(status, stocks_scanned, stocks_qualifying, stocks_saved, error_message, started_at, completed_at) VALUES (@status, @stocksScanned, @stocksQualifying, @stocksSaved, @errorMessage, @startedAt, @completedAt)`);

function mapRefresh(row) {
  if (!row) return null;
  return { id: row.id, status: row.status, stocksScanned: row.stocks_scanned, stocksQualifying: row.stocks_qualifying, stocksSaved: row.stocks_saved, errorMessage: row.error_message, startedAt: row.started_at, completedAt: row.completed_at };
}

export function saveRefreshLog(data) { insertRefreshLog.run(data); }
export function getLatestRefresh() { return mapRefresh(db.prepare('SELECT * FROM refresh_logs ORDER BY id DESC LIMIT 1').get()); }
export function getLastSuccessfulRefresh() { return mapRefresh(db.prepare(`SELECT * FROM refresh_logs WHERE status = 'SUCCESS' ORDER BY id DESC LIMIT 1`).get()); }
