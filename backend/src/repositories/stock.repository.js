import { db } from '../database/db.js';

const insertStock = db.prepare(`
  INSERT INTO stocks (rank, exchange, symbol, trading_symbol, company_name, token, ltp, previous_close, change_value, change_percent, open_price, high_price, low_price, volume, traded_value, total_buy_qty, total_sell_qty, week_high_52, week_low_52, exchange_feed_time, updated_at)
  VALUES (@rank, @exchange, @symbol, @tradingSymbol, @companyName, @token, @ltp, @previousClose, @changeValue, @changePercent, @openPrice, @highPrice, @lowPrice, @volume, @tradedValue, @totalBuyQty, @totalSellQty, @weekHigh52, @weekLow52, @exchangeFeedTime, @updatedAt)
`);

function mapStock(row) {
  return { rank: row.rank, exchange: row.exchange, symbol: row.symbol, tradingSymbol: row.trading_symbol, companyName: row.company_name, token: row.token, ltp: row.ltp, previousClose: row.previous_close, changeValue: row.change_value, changePercent: row.change_percent, openPrice: row.open_price, highPrice: row.high_price, lowPrice: row.low_price, volume: row.volume, tradedValue: row.traded_value, totalBuyQty: row.total_buy_qty, totalSellQty: row.total_sell_qty, weekHigh52: row.week_high_52, weekLow52: row.week_low_52, exchangeFeedTime: row.exchange_feed_time, updatedAt: row.updated_at };
}

export function replaceLatestStocks(rows) {
  db.prepare('DELETE FROM stocks').run();
  rows.forEach((row, index) => insertStock.run({ rank: index + 1, ...row }));
}

export function getLatestStocks() {
  return db.prepare('SELECT * FROM stocks ORDER BY rank ASC').all().map(mapStock);
}

export function getStockCount() {
  return db.prepare('SELECT COUNT(*) AS count FROM stocks').get().count;
}
