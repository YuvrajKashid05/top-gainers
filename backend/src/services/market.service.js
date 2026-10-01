import { collectTopGainers, getAngelSessionStatus } from "./angel.service.js";
import { getSettings } from "./settings.service.js";
import {
  getLatestStocks,
  getStockCount,
  replaceLatestStocks,
} from "../repositories/stock.repository.js";
import {
  cleanupHistory,
  getHistoryCount,
  insertSnapshot,
} from "../repositories/history.repository.js";
import {
  getLatestRefresh,
  getLastSuccessfulRefresh,
  saveRefreshLog,
} from "../repositories/refresh-log.repository.js";
import { db } from "../database/db.js";
import {
  isSnapshotMinute,
  isWithinMarketHours,
  nowIso,
} from "../utils/time.js";
import { env } from "../config/env.js";

let refreshLock = false;

export async function refreshMarket({ manual = false } = {}) {
  if (refreshLock)
    return {
      ok: false,
      skipped: true,
      message: "A market refresh is already running.",
    };
  const startedAt = nowIso();
  refreshLock = true;
  const settings = getSettings();
  try {
    if (
      !isWithinMarketHours(
        env.MARKET_OPEN,
        env.MARKET_CLOSE,
        env.MARKET_TIMEZONE,
      )
    )
      return {
        ok: false,
        skipped: true,
        message:
          "Market snapshot skipped: NSE market is closed (09:15-15:15 IST).",
        marketOpen: false,
      };
    if (!isSnapshotMinute(env.MARKET_TIMEZONE))
      return {
        ok: false,
        skipped: true,
        message:
          "Market snapshot skipped: snapshots are captured only every 5 minutes.",
        marketOpen: true,
      };
    const result = await collectTopGainers({ minPrice: settings.minPrice });
    const rows = result.candidates.slice(0, settings.topN);
    const completedAt = nowIso();
    if (!rows.length)
      throw new Error(
        "Angel One returned no qualifying positive-gain NSE EQ stocks for the configured price threshold.",
      );
    const transaction = db.transaction(() => {
      replaceLatestStocks(rows);
      insertSnapshot(rows, {
        topN: settings.topN,
        minPrice: settings.minPrice,
        capturedAt: completedAt,
      });
      saveRefreshLog({
        status: "SUCCESS",
        stocksScanned: result.universeCount,
        stocksQualifying: result.qualifyingCount,
        stocksSaved: rows.length,
        errorMessage: null,
        startedAt,
        completedAt,
      });
      cleanupHistory(settings.historyDays);
    });
    transaction();
    return {
      ok: true,
      manual,
      topN: settings.topN,
      minPrice: settings.minPrice,
      stocksScanned: result.universeCount,
      qualifyingStocks: result.qualifyingCount,
      stocksSaved: rows.length,
      completedAt,
      marketOpen: true,
      source: "Angel One SmartAPI",
    };
  } catch (error) {
    const completedAt = nowIso();
    const message =
      error instanceof Error ? error.message : "Unknown market refresh error";
    saveRefreshLog({
      status: "FAILED",
      stocksScanned: 0,
      stocksQualifying: 0,
      stocksSaved: 0,
      errorMessage: String(message).slice(0, 1000),
      startedAt,
      completedAt,
    });
    return {
      ok: false,
      manual,
      message,
      lastSuccessful: getLastSuccessfulRefresh(),
    };
  } finally {
    refreshLock = false;
  }
}

export function getMarketPayload() {
  const settings = getSettings();
  const rows = getLatestStocks();
  const latest = getLatestRefresh();
  const lastSuccessful = getLastSuccessfulRefresh();
  const marketOpen = isWithinMarketHours(
    env.MARKET_OPEN,
    env.MARKET_CLOSE,
    env.MARKET_TIMEZONE,
  );
  return {
    rows,
    topN: settings.topN,
    minPrice: settings.minPrice,
    lastUpdated: lastSuccessful?.completedAt || null,
    totalStocksScanned: lastSuccessful?.stocksScanned || 0,
    totalQualifyingStocks: lastSuccessful?.stocksQualifying || rows.length,
    dataSource: "Angel One SmartAPI",
    marketStatus: marketOpen ? "OPEN" : "CLOSED",
    marketOpen,
    latestRefresh: latest,
    lastSuccessful,
    stale: latest?.status === "FAILED",
    angel: getAngelSessionStatus(),
  };
}

export function getDatabaseStatus() {
  return {
    latest: getLatestRefresh(),
    lastSuccessful: getLastSuccessfulRefresh(),
    stockCount: getStockCount(),
    historyCount: getHistoryCount(),
  };
}
