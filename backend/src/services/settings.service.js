import { z } from 'zod';
import { db } from '../database/db.js';

const schema = z.object({
  topN: z.coerce.number().int().min(5).max(100),
  minPrice: z.coerce.number().finite().min(0),
  historyDays: z.coerce.number().int().min(1).max(30),
  refreshInterval: z.coerce.number().int().refine(v => [1, 5, 10, 15].includes(v), 'Refresh interval must be 1, 5, 10 or 15 minutes'),
  theme: z.enum(['light', 'dark', 'system'])
});

const readAll = db.prepare('SELECT setting_key, setting_value FROM settings');
const upsert = db.prepare(`
  INSERT INTO settings(setting_key, setting_value, updated_at)
  VALUES (@key, @value, @updatedAt)
  ON CONFLICT(setting_key) DO UPDATE SET
    setting_value = excluded.setting_value,
    updated_at = excluded.updated_at
`);

export function getSettings() {
  const rows = readAll.all();
  const raw = Object.fromEntries(rows.map(row => [row.setting_key, row.setting_value]));
  return {
    topN: Number(raw.topN ?? 20),
    minPrice: Number(raw.minPrice ?? 20),
    historyDays: Number(raw.historyDays ?? 5),
    refreshInterval: Number(raw.refreshInterval ?? 5),
    market: raw.market ?? 'NSE',
    segment: raw.segment ?? 'EQ',
    theme: raw.theme ?? 'system'
  };
}

export function validateSettings(input) {
  return schema.parse(input);
}

export function updateSettings(input) {
  const parsed = validateSettings(input);
  const updatedAt = new Date().toISOString();
  const tx = db.transaction(() => {
    for (const [key, value] of Object.entries(parsed)) {
      upsert.run({ key, value: String(value), updatedAt });
    }
  });
  tx();
  return getSettings();
}
