import "dotenv/config";
import path from "node:path";

const number = (key, fallback) => {
  const value = Number(process.env[key]);
  return Number.isFinite(value) ? value : fallback;
};

export const env = {
  PORT: number("PORT", 5000),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  DATABASE_PATH: process.env.DATABASE_PATH || "./data/market.db",
  ANGEL_API_KEY: process.env.ANGEL_API_KEY || "",
  ANGEL_CLIENT_CODE: process.env.ANGEL_CLIENT_CODE || "",
  ANGEL_PIN: process.env.ANGEL_PIN || "",
  ANGEL_TOTP_SECRET: process.env.ANGEL_TOTP_SECRET || "",
  ANGEL_CLIENT_LOCAL_IP: process.env.ANGEL_CLIENT_LOCAL_IP || "",
  ANGEL_CLIENT_PUBLIC_IP: process.env.ANGEL_CLIENT_PUBLIC_IP || "",
  ANGEL_MAC_ADDRESS: process.env.ANGEL_MAC_ADDRESS || "",
  MARKET_TIMEZONE: process.env.MARKET_TIMEZONE || "Asia/Kolkata",
  MARKET_OPEN: process.env.MARKET_OPEN || "09:15",
  MARKET_CLOSE: process.env.MARKET_CLOSE || "15:15",
  INSTRUMENT_REFRESH_HOURS: number("INSTRUMENT_REFRESH_HOURS", 24),
  QUOTE_BATCH_SIZE: Math.min(50, Math.max(1, number("QUOTE_BATCH_SIZE", 50))),
  REQUEST_TIMEOUT_MS: number("REQUEST_TIMEOUT_MS", 15000),
  MAX_RETRIES: Math.min(5, Math.max(0, number("MAX_RETRIES", 3))),
};

export const dbPath = path.resolve(process.cwd(), env.DATABASE_PATH);
