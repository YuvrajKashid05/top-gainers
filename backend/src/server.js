import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import './database/db.js';
import api from './routes/api.js';
import { startScheduler } from './jobs/scheduler.js';
import { refreshMarket } from './services/market.service.js';
import { isWithinMarketHours } from './utils/time.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN, methods: ['GET', 'POST', 'PUT'], credentials: false }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan('tiny', {
  skip: req => req.path === '/api/health'
}));
app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api', api);

app.use((err, _req, res, _next) => {
  console.error('[api]', err instanceof Error ? err.message : 'Unhandled error');
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(env.PORT, async () => {
  console.log(`NSE Top Gainers backend: http://localhost:${env.PORT}`);
  console.log(`Database: ${env.DATABASE_PATH}`);
  console.log(`Market: ${env.MARKET_TIMEZONE} ${env.MARKET_OPEN}-${env.MARKET_CLOSE}`);
  startScheduler();

  // Warm the dashboard during market hours without preventing server startup.
  if (isWithinMarketHours(env.MARKET_OPEN, env.MARKET_CLOSE, env.MARKET_TIMEZONE)) {
    const result = await refreshMarket({ manual: false });
    if (!result.ok) console.error('[startup-refresh]', result.message);
  }
});
