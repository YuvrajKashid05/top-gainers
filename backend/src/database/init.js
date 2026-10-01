import { db } from "./db.js";
import { defaultSettings, schemaSql } from "./schema.sql.js";

db.exec(schemaSql);

const insertSetting = db.prepare(`
  INSERT OR IGNORE INTO settings(setting_key, setting_value, updated_at)
  VALUES (?, ?, ?)
`);
const now = () => new Date().toISOString();

for (const [key, value] of Object.entries(defaultSettings))
  insertSetting.run(key, String(value), now());
