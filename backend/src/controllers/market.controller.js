import {
  getHistory,
  getHistoryExport,
  getSymbolHistory,
} from "../repositories/history.repository.js";
import { getLatestStocks } from "../repositories/stock.repository.js";
import {
  getDatabaseStatus,
  getMarketPayload,
  refreshMarket,
} from "../services/market.service.js";
import { getSettings } from "../services/settings.service.js";
import { getSchedulerStatus } from "../jobs/scheduler.js";

function csvEscape(value) {
  const string = value == null ? "" : String(value);
  return `"${string.replaceAll('"', '""')}"`;
}

export function topController(_req, res) {
  return res.json({ success: true, ...getMarketPayload() });
}
export function latestController(_req, res) {
  return res.json({
    success: true,
    settings: getSettings(),
    rows: getLatestStocks(),
  });
}
export async function manualRefreshController(_req, res) {
  const result = await refreshMarket({ manual: true });
  return res.status(result.ok ? 200 : 502).json(result);
}
export function statusController(_req, res) {
  return res.json({
    success: true,
    settings: getSettings(),
    database: getDatabaseStatus(),
    scheduler: getSchedulerStatus(),
    market: getMarketPayload(),
  });
}
export function historyController(req, res) {
  return res.json({ success: true, ...getHistory(req.validated.query) });
}
export function symbolHistoryController(req, res) {
  const { symbol } = req.validated.params;
  return res.json({ success: true, symbol, rows: getSymbolHistory(symbol) });
}
export function historyCsvController(req, res) {
  const rows = getHistoryExport(req.validated.query);
  const headers = [
    "Rank",
    "Symbol",
    "Trading Symbol",
    "Token",
    "LTP",
    "Previous Close",
    "Change",
    "Change %",
    "Volume",
    "Traded Value",
    "Top N",
    "Min Price",
    "Captured At",
  ];
  const csv = [
    headers,
    ...rows.map((row) => [
      row.rank,
      row.symbol,
      row.tradingSymbol,
      row.token,
      row.ltp,
      row.previousClose,
      row.changeValue,
      row.changePercent,
      row.volume,
      row.tradedValue,
      row.topNAtCapture,
      row.minPriceAtCapture,
      row.capturedAt,
    ]),
  ]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="nse-top-gainers-history.csv"',
  );
  return res.send(csv);
}
export function historyJsonController(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="nse-top-gainers-history.json"',
  );
  return res.json({
    exportedAt: new Date().toISOString(),
    rows: getHistoryExport(req.validated.query),
  });
}
