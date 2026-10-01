import { db } from "./db.js";
import { getSettings } from "../services/settings.service.js";

const insertStock = db.prepare(`
  INSERT INTO stocks (
    rank, exchange, symbol, trading_symbol, company_name, token,
    ltp, previous_close, change_value, change_percent,
    open_price, high_price, low_price, volume, traded_value,
    total_buy_qty, total_sell_qty, week_high_52, week_low_52,
    exchange_feed_time, updated_at
  ) VALUES (
    @rank, @exchange, @symbol, @tradingSymbol, @companyName, @token,
    @ltp, @previousClose, @changeValue, @changePercent,
    @openPrice, @highPrice, @lowPrice, @volume, @tradedValue,
    @totalBuyQty, @totalSellQty, @weekHigh52, @weekLow52,
    @exchangeFeedTime, @updatedAt
  )
`);

const insertHistory = db.prepare(`
  INSERT INTO top20_history (
    rank, symbol, trading_symbol, token, ltp, previous_close,
    change_value, change_percent, volume, traded_value,
    top_n_at_capture, min_price_at_capture, captured_at
  ) VALUES (
    @rank, @symbol, @tradingSymbol, @token, @ltp, @previousClose,
    @changeValue, @changePercent, @volume, @tradedValue,
    @topN, @minPrice, @capturedAt
  )
`);

const insertRefreshLog = db.prepare(`
  INSERT INTO refresh_logs(status, stocks_scanned, stocks_qualifying, stocks_saved, error_message, started_at, completed_at)
  VALUES (@status, @stocksScanned, @stocksQualifying, @stocksSaved, @errorMessage, @startedAt, @completedAt)
`);

export function saveSuccessfulRefresh({
  rows,
  stocksScanned,
  qualifyingCount,
  startedAt,
  completedAt,
  settings,
}) {
  const capturedAt = completedAt;
  const transaction = db.transaction(() => {
    db.prepare("DELETE FROM stocks").run();
    for (const [index, row] of rows.entries()) {
      insertStock.run({ rank: index + 1, ...row });
      insertHistory.run({
        rank: index + 1,
        symbol: row.symbol,
        tradingSymbol: row.tradingSymbol,
        token: row.token,
        ltp: row.ltp,
        previousClose: row.previousClose,
        changeValue: row.changeValue,
        changePercent: row.changePercent,
        volume: row.volume,
        tradedValue: row.tradedValue,
        topN: settings.topN,
        minPrice: settings.minPrice,
        capturedAt,
      });
    }
    insertRefreshLog.run({
      status: "SUCCESS",
      stocksScanned,
      stocksQualifying: qualifyingCount,
      stocksSaved: rows.length,
      errorMessage: null,
      startedAt,
      completedAt,
    });
    cleanupHistory(settings.historyDays);
  });
  transaction();
}

export function saveFailedRefresh({ errorMessage, startedAt, completedAt }) {
  insertRefreshLog.run({
    status: "FAILED",
    stocksScanned: 0,
    stocksQualifying: 0,
    stocksSaved: 0,
    errorMessage: String(errorMessage).slice(0, 1000),
    startedAt,
    completedAt,
  });
}

export function cleanupHistory(historyDays = getSettings().historyDays) {
  db.prepare(
    `
    DELETE FROM top20_history
    WHERE datetime(captured_at) < datetime('now', ?)
  `,
  ).run(`-${Number(historyDays)} days`);
}

function mapStock(row) {
  return {
    rank: row.rank,
    exchange: row.exchange,
    symbol: row.symbol,
    tradingSymbol: row.trading_symbol,
    companyName: row.company_name,
    token: row.token,
    ltp: row.ltp,
    previousClose: row.previous_close,
    changeValue: row.change_value,
    changePercent: row.change_percent,
    openPrice: row.open_price,
    highPrice: row.high_price,
    lowPrice: row.low_price,
    volume: row.volume,
    tradedValue: row.traded_value,
    totalBuyQty: row.total_buy_qty,
    totalSellQty: row.total_sell_qty,
    weekHigh52: row.week_high_52,
    weekLow52: row.week_low_52,
    exchangeFeedTime: row.exchange_feed_time,
    updatedAt: row.updated_at,
  };
}

export function getLatestStocks() {
  return db
    .prepare("SELECT * FROM stocks ORDER BY rank ASC")
    .all()
    .map(mapStock);
}

export function getLatestRefresh() {
  const row = db
    .prepare("SELECT * FROM refresh_logs ORDER BY id DESC LIMIT 1")
    .get();
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    stocksScanned: row.stocks_scanned,
    stocksQualifying: row.stocks_qualifying,
    stocksSaved: row.stocks_saved,
    errorMessage: row.error_message,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

export function getLastSuccessfulRefresh() {
  const row = db
    .prepare(
      `SELECT * FROM refresh_logs WHERE status = 'SUCCESS' ORDER BY id DESC LIMIT 1`,
    )
    .get();
  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    stocksScanned: row.stocks_scanned,
    stocksQualifying: row.stocks_qualifying,
    stocksSaved: row.stocks_saved,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

export function getHistory({
  date,
  symbol,
  rank,
  topN,
  page = 1,
  pageSize = 50,
}) {
  const where = [];
  const params = {};
  if (date) {
    where.push("substr(captured_at, 1, 10) = @date");
    params.date = date;
  }
  if (symbol) {
    where.push("(symbol LIKE @symbol OR trading_symbol LIKE @symbol)");
    params.symbol = `%${symbol}%`;
  }
  if (rank) {
    where.push("rank = @rank");
    params.rank = rank;
  }
  if (topN) {
    where.push("top_n_at_capture = @topN");
    params.topN = topN;
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = db
    .prepare(`SELECT COUNT(*) AS count FROM top20_history ${clause}`)
    .get(params).count;
  const offset = (page - 1) * pageSize;
  const rows = db
    .prepare(
      `
    SELECT id, rank, symbol, trading_symbol AS tradingSymbol, token,
      ltp, previous_close AS previousClose, change_value AS changeValue,
      change_percent AS changePercent, volume, traded_value AS tradedValue,
      top_n_at_capture AS topNAtCapture,
      min_price_at_capture AS minPriceAtCapture,
      captured_at AS capturedAt
    FROM top20_history
    ${clause}
    ORDER BY captured_at DESC, rank ASC
    LIMIT @limit OFFSET @offset
  `,
    )
    .all({ ...params, limit: pageSize, offset });
  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function getSymbolHistory(symbol, limit = 200) {
  return db
    .prepare(
      `
    SELECT id, rank, symbol, trading_symbol AS tradingSymbol, token,
      ltp, previous_close AS previousClose, change_value AS changeValue,
      change_percent AS changePercent, volume, traded_value AS tradedValue,
      top_n_at_capture AS topNAtCapture,
      captured_at AS capturedAt
    FROM top20_history
    WHERE symbol = ? OR trading_symbol = ?
    ORDER BY captured_at ASC
    LIMIT ?
  `,
    )
    .all(symbol, symbol, limit);
}

export function getHistoryExport(filters = {}) {
  return getHistory({ ...filters, page: 1, pageSize: 100000 }).rows;
}

export function getStatus() {
  return {
    latest: getLatestRefresh(),
    lastSuccessful: getLastSuccessfulRefresh(),
    stockCount: db.prepare("SELECT COUNT(*) AS count FROM stocks").get().count,
    historyCount: db
      .prepare("SELECT COUNT(*) AS count FROM top20_history")
      .get().count,
  };
}
