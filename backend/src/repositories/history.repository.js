import { db } from "../database/db.js";

const insertHistory = db.prepare(`
  INSERT INTO top20_history (rank, symbol, trading_symbol, token, ltp, previous_close, change_value, change_percent, volume, traded_value, top_n_at_capture, min_price_at_capture, captured_at)
  VALUES (@rank, @symbol, @tradingSymbol, @token, @ltp, @previousClose, @changeValue, @changePercent, @volume, @tradedValue, @topN, @minPrice, @capturedAt)
`);

export function insertSnapshot(rows, { topN, minPrice, capturedAt }) {
  rows.forEach((row, index) =>
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
      topN,
      minPrice,
      capturedAt,
    }),
  );
}

export function cleanupHistory(historyDays) {
  db.prepare(
    `DELETE FROM top20_history WHERE datetime(captured_at) < datetime('now', ?)`,
  ).run(`-${Number(historyDays)} days`);
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
      `SELECT id, rank, symbol, trading_symbol AS tradingSymbol, token, ltp, previous_close AS previousClose, change_value AS changeValue, change_percent AS changePercent, volume, traded_value AS tradedValue, top_n_at_capture AS topNAtCapture, min_price_at_capture AS minPriceAtCapture, captured_at AS capturedAt FROM top20_history ${clause} ORDER BY captured_at DESC, rank ASC LIMIT @limit OFFSET @offset`,
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
      `SELECT id, rank, symbol, trading_symbol AS tradingSymbol, token, ltp, previous_close AS previousClose, change_value AS changeValue, change_percent AS changePercent, volume, traded_value AS tradedValue, top_n_at_capture AS topNAtCapture, captured_at AS capturedAt FROM top20_history WHERE symbol = ? OR trading_symbol = ? ORDER BY captured_at ASC LIMIT ?`,
    )
    .all(symbol, symbol, limit);
}

export function getHistoryExport(filters = {}) {
  return getHistory({ ...filters, page: 1, pageSize: 100000 }).rows;
}
export function getHistoryCount() {
  return db.prepare("SELECT COUNT(*) AS count FROM top20_history").get().count;
}
