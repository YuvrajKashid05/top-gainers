import { collectTopGainers, getAngelSessionStatus } from './angel.service.js';
import { getSettings } from './settings.service.js';
import { getLatestStocks, getLatestRefresh, getLastSuccessfulRefresh, saveFailedRefresh, saveSuccessfulRefresh } from '../database/repository.js';
import { isWithinMarketHours, nowIso } from '../utils/time.js';
import { env } from '../config/env.js';

let refreshLock = false;

export async function refreshMarket({ manual = false } = {}) {
  if (refreshLock) {
    return { ok: false, skipped: true, message: 'A market refresh is already running.' };
  }

  const startedAt = nowIso();
  refreshLock = true;
  const settings = getSettings();

  try {
    if (!manual && !isWithinMarketHours(env.MARKET_OPEN, env.MARKET_CLOSE, env.MARKET_TIMEZONE)) {
      return { ok: true, skipped: true, message: 'Outside NSE market hours.', marketOpen: false };
    }

    const result = await collectTopGainers({ minPrice: settings.minPrice });
    const rows = result.candidates.slice(0, settings.topN);
    const completedAt = nowIso();

    if (!rows.length) {
      throw new Error('Angel One returned no qualifying positive-gain NSE EQ stocks for the configured price threshold.');
    }

    saveSuccessfulRefresh({
      rows,
      stocksScanned: result.universeCount,
      qualifyingCount: result.qualifyingCount,
      startedAt,
      completedAt,
      settings
    });

    return {
      ok: true,
      manual,
      topN: settings.topN,
      minPrice: settings.minPrice,
      stocksScanned: result.universeCount,
      qualifyingStocks: result.qualifyingCount,
      stocksSaved: rows.length,
      completedAt,
      marketOpen: isWithinMarketHours(env.MARKET_OPEN, env.MARKET_CLOSE, env.MARKET_TIMEZONE),
      source: 'Angel One SmartAPI'
    };
  } catch (error) {
    const completedAt = nowIso();
    const message = error instanceof Error ? error.message : 'Unknown market refresh error';
    saveFailedRefresh({ errorMessage: message, startedAt, completedAt });
    return {
      ok: false,
      manual,
      message,
      lastSuccessful: getLastSuccessfulRefresh()
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
  const marketOpen = isWithinMarketHours(env.MARKET_OPEN, env.MARKET_CLOSE, env.MARKET_TIMEZONE);
  return {
    rows,
    topN: settings.topN,
    minPrice: settings.minPrice,
    lastUpdated: lastSuccessful?.completedAt || null,
    totalStocksScanned: lastSuccessful?.stocksScanned || 0,
    totalQualifyingStocks: lastSuccessful?.stocksQualifying || rows.length,
    dataSource: 'Angel One SmartAPI',
    marketStatus: marketOpen ? 'OPEN' : 'CLOSED',
    marketOpen,
    latestRefresh: latest,
    lastSuccessful,
    stale: latest?.status === 'FAILED',
    angel: getAngelSessionStatus()
  };
}
