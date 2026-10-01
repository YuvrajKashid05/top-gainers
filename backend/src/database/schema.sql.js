export const schemaSql = `
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT, rank INTEGER NOT NULL, exchange TEXT NOT NULL, symbol TEXT NOT NULL,
  trading_symbol TEXT NOT NULL, company_name TEXT, token TEXT NOT NULL, ltp REAL, previous_close REAL,
  change_value REAL, change_percent REAL, open_price REAL, high_price REAL, low_price REAL, volume REAL,
  traded_value REAL, total_buy_qty REAL, total_sell_qty REAL, week_high_52 REAL, week_low_52 REAL,
  exchange_feed_time TEXT, updated_at TEXT NOT NULL, UNIQUE(token)
);

CREATE TABLE IF NOT EXISTS top20_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT, rank INTEGER NOT NULL, symbol TEXT NOT NULL, trading_symbol TEXT NOT NULL,
  token TEXT, ltp REAL, previous_close REAL, change_value REAL, change_percent REAL, volume REAL, traded_value REAL,
  top_n_at_capture INTEGER NOT NULL, min_price_at_capture REAL NOT NULL, captured_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, status TEXT NOT NULL, stocks_scanned INTEGER NOT NULL DEFAULT 0,
  stocks_qualifying INTEGER NOT NULL DEFAULT 0, stocks_saved INTEGER NOT NULL DEFAULT 0, error_message TEXT,
  started_at TEXT NOT NULL, completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_history_captured_at ON top20_history(captured_at);
CREATE INDEX IF NOT EXISTS idx_history_symbol ON top20_history(symbol);
CREATE INDEX IF NOT EXISTS idx_history_rank ON top20_history(rank);
CREATE INDEX IF NOT EXISTS idx_refresh_started ON refresh_logs(started_at);
`;

export const defaultSettings = { topN: 20, minPrice: 20, historyDays: 5, refreshInterval: 5, market: 'NSE', segment: 'EQ', theme: 'system' };
