import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getSettingsController, putSettingsController } from '../controllers/settings.controller.js';
import { historyController, historyCsvController, historyJsonController, latestController, manualRefreshController, statusController, symbolHistoryController, topController } from '../controllers/market.controller.js';

const router = Router();
const refreshLimiter = rateLimit({ windowMs: 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false });
const writeLimiter = rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });

router.get('/health', (_req, res) => res.json({ success: true, service: 'nse-top-gainers', timestamp: new Date().toISOString() }));
router.get('/market/top', topController);
router.get('/market/latest', latestController);
router.get('/market/history', historyController);
router.get('/market/history/export.csv', historyCsvController);
router.get('/market/history/export.json', historyJsonController);
router.get('/market/history/:symbol', symbolHistoryController);
router.post('/market/refresh', refreshLimiter, manualRefreshController);
router.get('/market/status', statusController);
router.get('/settings', getSettingsController);
router.put('/settings', writeLimiter, putSettingsController);

export default router;
