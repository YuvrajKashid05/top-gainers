import { env } from './config/env.js';
import { app } from './app.js';
import { startScheduler } from './jobs/scheduler.js';

app.listen(env.PORT, env.HOST, () => {
  console.log(`NSE Top Gainers backend: http://${env.HOST}:${env.PORT}`);
  console.log(`Database: ${env.DATABASE_PATH}`);
  console.log(`Market: ${env.MARKET_TIMEZONE} ${env.MARKET_OPEN}-${env.MARKET_CLOSE}`);
  startScheduler();
  console.log(
    'Snapshot cycle: every 5 minutes from 09:15 through 15:15 IST; no market fetches outside this window.',
  );
});
