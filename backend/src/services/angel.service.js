import axios from "axios";
import { authenticator } from "otplib";
import { env } from "../config/env.js";
import {
  detectLocalIp,
  detectMacAddress,
  detectPublicIp,
} from "../utils/network.js";

const BASE_URL = "https://apiconnect.angelone.in";
const LOGIN_URL = `${BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword`;
const QUOTE_URL = `${BASE_URL}/rest/secure/angelbroking/market/v1/quote/`;
const INSTRUMENT_URL =
  "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json";

let session = { jwtToken: "", feedToken: "", loggedInDate: "" };
let networkIdentity = null;
let instruments = [];
let instrumentsLoadedAt = 0;
let loginPromise = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function numberOrNull(value) {
  if (value === null || value === undefined || value === "" || value === "-")
    return null;
  const number = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

function safeString(value) {
  return value === null || value === undefined ? null : String(value);
}

function getToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: env.MARKET_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function getNetworkIdentity() {
  if (networkIdentity) return networkIdentity;
  networkIdentity = {
    localIp: env.ANGEL_CLIENT_LOCAL_IP || detectLocalIp(),
    publicIp: env.ANGEL_CLIENT_PUBLIC_IP || (await detectPublicIp()),
    mac: env.ANGEL_MAC_ADDRESS || detectMacAddress(),
  };
  return networkIdentity;
}

function assertCredentials() {
  const missing = [
    "ANGEL_API_KEY",
    "ANGEL_CLIENT_CODE",
    "ANGEL_PIN",
    "ANGEL_TOTP_SECRET",
  ].filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(
      `Angel One credentials are not configured: ${missing.join(", ")}`,
    );
  }
}

async function login() {
  assertCredentials();
  const identity = await getNetworkIdentity();
  const totp = authenticator.generate(
    env.ANGEL_TOTP_SECRET.replace(/\s+/g, ""),
  );

  const response = await axios.post(
    LOGIN_URL,
    {
      clientcode: env.ANGEL_CLIENT_CODE,
      password: env.ANGEL_PIN,
      totp,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-PrivateKey": env.ANGEL_API_KEY,
        "X-UserType": "USER",
        "X-SourceID": "WEB",
        "X-ClientLocalIP": identity.localIp,
        "X-ClientPublicIP": identity.publicIp,
        "X-MACAddress": identity.mac,
      },
      timeout: env.REQUEST_TIMEOUT_MS,
      validateStatus: () => true,
    },
  );

  if (
    response.status < 200 ||
    response.status >= 300 ||
    !response.data?.status ||
    !response.data?.data?.jwtToken
  ) {
    throw new Error(
      `Angel One login failed: ${response.data?.message || `HTTP ${response.status}`}`,
    );
  }

  session = {
    jwtToken: String(response.data.data.jwtToken).replace(/^Bearer\s+/i, ""),
    feedToken: String(response.data.data.feedToken || ""),
    loggedInDate: getToday(),
  };
}

async function ensureSession(force = false) {
  if (!force && session.jwtToken && session.loggedInDate === getToday()) return;
  if (!loginPromise) {
    loginPromise = login().finally(() => {
      loginPromise = null;
    });
  }
  await loginPromise;
}

function headers() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-PrivateKey": env.ANGEL_API_KEY,
    "X-UserType": "USER",
    "X-SourceID": "WEB",
    "X-ClientLocalIP": networkIdentity?.localIp || "127.0.0.1",
    "X-ClientPublicIP": networkIdentity?.publicIp || "0.0.0.0",
    "X-MACAddress": networkIdentity?.mac || "00:00:00:00:00:00",
    Authorization: `Bearer ${session.jwtToken}`,
  };
}

function authFailure(response) {
  return (
    response.status === 401 ||
    response.status === 403 ||
    ["AB1010", "AB1011"].includes(String(response.data?.errorcode || ""))
  );
}

async function withRetry(operation, retries = env.MAX_RETRIES) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      const retryable = status === 429 || status >= 500 || !status;
      if (!retryable || attempt === retries) break;
      await sleep(500 * 2 ** attempt);
    }
  }
  throw lastError;
}

export async function loadNseEquityInstruments(force = false) {
  if (
    !force &&
    instruments.length &&
    Date.now() - instrumentsLoadedAt < env.INSTRUMENT_REFRESH_HOURS * 3600000
  ) {
    return instruments;
  }

  const response = await withRetry(() =>
    axios.get(INSTRUMENT_URL, {
      timeout: 60000,
      responseType: "json",
    }),
  );

  if (!Array.isArray(response.data))
    throw new Error(
      "Angel One instrument master returned an unexpected response",
    );

  instruments = response.data
    .filter((item) => {
      const exchange = String(item.exch_seg || "").toUpperCase();
      const symbol = String(item.symbol || "").toUpperCase();
      return (
        exchange === "NSE" && symbol.endsWith("-EQ") && Boolean(item.token)
      );
    })
    .map((item) => ({
      token: String(item.token),
      symbol: String(item.name || item.symbol || "").trim(),
      tradingSymbol: String(item.symbol || "").trim(),
      companyName: String(item.name || "").trim() || null,
      exchange: "NSE",
      instrumentType: "EQ",
    }));

  instrumentsLoadedAt = Date.now();
  return instruments;
}

async function quoteBatch(tokens) {
  await ensureSession();
  const response = await axios.post(
    QUOTE_URL,
    {
      mode: "FULL",
      exchangeTokens: { NSE: tokens },
    },
    {
      headers: headers(),
      timeout: env.REQUEST_TIMEOUT_MS,
      validateStatus: () => true,
    },
  );

  if (authFailure(response)) {
    await ensureSession(true);
    const retryResponse = await axios.post(
      QUOTE_URL,
      {
        mode: "FULL",
        exchangeTokens: { NSE: tokens },
      },
      {
        headers: headers(),
        timeout: env.REQUEST_TIMEOUT_MS,
        validateStatus: () => true,
      },
    );
    if (
      retryResponse.status < 200 ||
      retryResponse.status >= 300 ||
      !retryResponse.data?.status
    ) {
      throw new Error(
        `Angel One quote request failed: ${retryResponse.data?.message || `HTTP ${retryResponse.status}`}`,
      );
    }
    return retryResponse.data?.data?.fetched || [];
  }

  if (
    response.status < 200 ||
    response.status >= 300 ||
    !response.data?.status
  ) {
    const error = new Error(
      `Angel One quote request failed: ${response.data?.message || `HTTP ${response.status}`}`,
    );
    error.response = response;
    throw error;
  }

  return response.data?.data?.fetched || [];
}

function normalizeQuote(quote, instrumentMap, maxPrice) {
  const token = String(quote.symbolToken || quote.symboltoken || "");
  const instrument = instrumentMap.get(token);
  if (!instrument) return null;

  const ltp = numberOrNull(quote.ltp ?? quote.lastPrice);
  const previousClose = numberOrNull(
    quote.close ?? quote.previousClose ?? quote.prevClose,
  );
  if (
    ltp === null ||
    previousClose === null ||
    previousClose <= 0 ||
    ltp >= maxPrice
  )
    return null;

  const changeValue =
    numberOrNull(quote.netChange ?? quote.net_change) ?? ltp - previousClose;
  const changePercent =
    numberOrNull(quote.percentChange ?? quote.pChange) ??
    ((ltp - previousClose) / previousClose) * 100;
  if (!Number.isFinite(changePercent) || changePercent <= 0) return null;

  const volume = numberOrNull(
    quote.tradeVolume ??
      quote.tradedVolume ??
      quote.totalTradedVolume ??
      quote.volume,
  );
  const averagePrice = numberOrNull(quote.averagePrice ?? quote.avgPrice);
  const tradedValue =
    numberOrNull(
      quote.totalTradedValue ?? quote.tradedValue ?? quote.turnover,
    ) ??
    (volume !== null && averagePrice !== null ? volume * averagePrice : null);

  return {
    exchange: "NSE",
    symbol: instrument.symbol,
    tradingSymbol: instrument.tradingSymbol,
    companyName: instrument.companyName,
    token,
    instrumentType: "EQ",
    ltp,
    previousClose,
    changeValue,
    changePercent,
    openPrice: numberOrNull(quote.open),
    highPrice: numberOrNull(quote.high),
    lowPrice: numberOrNull(quote.low),
    volume,
    tradedValue,
    totalBuyQty: numberOrNull(quote.totBuyQuan ?? quote.totalBuyQuantity),
    totalSellQty: numberOrNull(quote.totSellQuan ?? quote.totalSellQuantity),
    weekHigh52: numberOrNull(quote["52WeekHigh"] ?? quote.weekHigh52),
    weekLow52: numberOrNull(quote["52WeekLow"] ?? quote.weekLow52),
    exchangeFeedTime: safeString(quote.exchFeedTime ?? quote.exchangeFeedTime),
    updatedAt: new Date().toISOString(),
  };
}

export async function collectTopGainers({ minPrice }) {
  const universe = await loadNseEquityInstruments();
  const instrumentMap = new Map(universe.map((item) => [item.token, item]));
  const candidates = [];
  let batches = 0;

  for (let i = 0; i < universe.length; i += env.QUOTE_BATCH_SIZE) {
    const tokens = universe
      .slice(i, i + env.QUOTE_BATCH_SIZE)
      .map((item) => item.token);
    batches += 1;
    const quotes = await withRetry(() => quoteBatch(tokens));
    for (const quote of quotes) {
      const row = normalizeQuote(quote, instrumentMap, minPrice);
      if (row) candidates.push(row);
    }
    // Stay below burst limits even when the configured batch size is changed.
    if (i + env.QUOTE_BATCH_SIZE < universe.length) await sleep(120);
  }

  candidates.sort((a, b) => {
    if (b.changePercent !== a.changePercent)
      return b.changePercent - a.changePercent;
    return String(a.tradingSymbol).localeCompare(String(b.tradingSymbol));
  });

  return {
    universeCount: universe.length,
    qualifyingCount: candidates.length,
    batches,
    candidates,
  };
}

export function getAngelSessionStatus() {
  return {
    authenticated: Boolean(session.jwtToken),
    sessionDate: session.loggedInDate || null,
    instrumentCount: instruments.length,
    instrumentCacheAgeMs: instrumentsLoadedAt
      ? Date.now() - instrumentsLoadedAt
      : null,
  };
}
