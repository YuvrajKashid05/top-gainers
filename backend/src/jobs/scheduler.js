import cron from "node-cron";
import { getSettings } from "../services/settings.service.js";
import { refreshMarket } from "../services/market.service.js";
import { isWithinMarketHours } from "../utils/time.js";
import { env } from "../config/env.js";

const SNAPSHOT_INTERVAL_MINUTES = 5;
let task = null;
let running = false;

// Fixed NSE snapshot schedule: 09:15, 09:20, ... 15:15 Asia/Kolkata.
// The scheduler itself is always alive, but refreshMarket is guarded by market hours.
const expression = () => `*/${SNAPSHOT_INTERVAL_MINUTES} * * * *`;

export function startScheduler() {
  scheduleWithCurrentSettings();
}

export function scheduleWithCurrentSettings() {
  if (task) task.stop();
  task = cron.schedule(
    expression(),
    async () => {
      if (
        running ||
        !isWithinMarketHours(
          env.MARKET_OPEN,
          env.MARKET_CLOSE,
          env.MARKET_TIMEZONE,
        )
      )
        return;
      running = true;
      try {
        const result = await refreshMarket({ manual: false });
        if (!result.skipped)
          console.log(
            `[scheduler] ${result.ok ? "success" : "failure"} topN=${getSettings().topN}`,
          );
      } catch (error) {
        console.error(
          "[scheduler] refresh error:",
          error instanceof Error ? error.message : "unknown",
        );
      } finally {
        running = false;
      }
    },
    { timezone: env.MARKET_TIMEZONE },
  );
}

export function getSchedulerStatus() {
  return {
    running,
    active: Boolean(task),
    intervalMinutes: SNAPSHOT_INTERVAL_MINUTES,
    cron: expression(),
    marketOpen: env.MARKET_OPEN,
    marketClose: env.MARKET_CLOSE,
    timezone: env.MARKET_TIMEZONE,
  };
}
