import cron from 'node-cron';
import { getSettings } from '../services/settings.service.js';
import { refreshMarket } from '../services/market.service.js';
import { isWithinMarketHours } from '../utils/time.js';
import { env } from '../config/env.js';

let task = null;
let running = false;

function expression(minutes) {
  return `*/${minutes} * * * *`;
}

export function startScheduler() {
  scheduleWithCurrentSettings();
}

export function scheduleWithCurrentSettings() {
  if (task) task.stop();
  const settings = getSettings();
  task = cron.schedule(expression(settings.refreshInterval), async () => {
    if (running || !isWithinMarketHours(env.MARKET_OPEN, env.MARKET_CLOSE, env.MARKET_TIMEZONE)) return;
    running = true;
    try {
      const result = await refreshMarket({ manual: false });
      if (!result.skipped) console.log(`[scheduler] ${result.ok ? 'success' : 'failure'} topN=${settings.topN}`);
    } catch (error) {
      console.error('[scheduler] refresh error:', error instanceof Error ? error.message : 'unknown');
    } finally {
      running = false;
    }
  }, { timezone: 'Asia/Kolkata' });
}

export function getSchedulerStatus() {
  const settings = getSettings();
  return { running, active: Boolean(task), intervalMinutes: settings.refreshInterval, cron: expression(settings.refreshInterval) };
}
