import { db } from "../database/db.js";
import { settingsSchema } from "../validators/settings.validators.js";

const readAll = db.prepare("SELECT setting_key, setting_value FROM settings");
const upsert = db.prepare(
  `INSERT INTO settings(setting_key, setting_value, updated_at) VALUES (@key, @value, @updatedAt) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = excluded.updated_at`,
);

export function getSettings() {
  const raw = Object.fromEntries(
    readAll.all().map((row) => [row.setting_key, row.setting_value]),
  );
  return {
    topN: Number(raw.topN ?? 20),
    minPrice: Number(raw.minPrice ?? 20),
    historyDays: Number(raw.historyDays ?? 5),
    refreshInterval: 5,
    market: raw.market ?? "NSE",
    segment: raw.segment ?? "EQ",
    theme: raw.theme ?? "system",
  };
}
export function updateSettings(input) {
  const parsed = settingsSchema.parse(input);
  const updatedAt = new Date().toISOString();
  const transaction = db.transaction(() => {
    for (const [key, value] of Object.entries(parsed))
      upsert.run({ key, value: String(value), updatedAt });
  });
  transaction();
  return getSettings();
}
