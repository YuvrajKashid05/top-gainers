import { z } from 'zod';
import { getHistory, getHistoryExport, getLatestStocks, getSymbolHistory, getStatus } from '../database/repository.js';
import { getMarketPayload, refreshMarket } from '../services/market.service.js';
import { getSettings } from '../services/settings.service.js';
import { getSchedulerStatus } from '../jobs/scheduler.js';

const historyQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  symbol: z.string().trim().max(40).optional(),
  rank: z.coerce.number().int().min(1).max(100).optional(),
  topN: z.coerce.number().int().min(5).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(200).default(50)
});

function csvEscape(value) {
  const string = value === null || value === undefined ? '' : String(value);
  return `"${string.replaceAll('"', '""')}"`;
}

export function topController(_req, res) {
  return res.json({ success: true, ...getMarketPayload() });
}

export function latestController(_req, res) {
  return res.json({ success: true, settings: getSettings(), rows: getLatestStocks() });
}

export async function manualRefreshController(_req, res) {
  const result = await refreshMarket({ manual: true });
  return res.status(result.ok ? 200 : 502).json(result);
}

export function statusController(_req, res) {
  return res.json({
    success: true,
    settings: getSettings(),
    database: getStatus(),
    scheduler: getSchedulerStatus(),
    market: getMarketPayload()
  });
}

export function historyController(req, res) {
  const parsed = historyQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0]?.message || 'Invalid history filters' });
  return res.json({ success: true, ...getHistory(parsed.data) });
}

export function symbolHistoryController(req, res) {
  const symbol = String(req.params.symbol || '').trim();
  if (!symbol || symbol.length > 40) return res.status(400).json({ success: false, message: 'Invalid symbol' });
  return res.json({ success: true, symbol, rows: getSymbolHistory(symbol) });
}

export function historyCsvController(req, res) {
  const parsed = historyQuery.omit({ page: true, pageSize: true }).safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid history filters' });
  const rows = getHistoryExport(parsed.data);
  const headers = ['Rank', 'Symbol', 'Trading Symbol', 'Token', 'LTP', 'Previous Close', 'Change', 'Change %', 'Volume', 'Traded Value', 'Top N', 'Min Price', 'Captured At'];
  const csv = [headers, ...rows.map(row => [row.rank, row.symbol, row.tradingSymbol, row.token, row.ltp, row.previousClose, row.changeValue, row.changePercent, row.volume, row.tradedValue, row.topNAtCapture, row.minPriceAtCapture, row.capturedAt])]
    .map(row => row.map(csvEscape).join(','))
    .join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="nse-top-gainers-history.csv"');
  return res.send(csv);
}

export function historyJsonController(req, res) {
  const parsed = historyQuery.omit({ page: true, pageSize: true }).safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid history filters' });
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="nse-top-gainers-history.json"');
  return res.json({ exportedAt: new Date().toISOString(), rows: getHistoryExport(parsed.data) });
}
