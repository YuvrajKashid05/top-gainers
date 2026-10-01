import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getSettingsController, putSettingsController } from '../controllers/settings.controller.js';
import { historyController, historyCsvController, historyJsonController, latestController, manualRefreshController, statusController, symbolHistoryController, topController } from '../controllers/market.controller.js';
import { validate } from '../middleware/validate.js';
import { historyQuerySchema, symbolParamsSchema } from '../validators/market.validators.js';
import { settingsSchema } from '../validators/settings.validators.js';

const router = Router();
const refreshLimiter = rateLimit({ windowMs: 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false });
const writeLimiter = rateLimit({ windowMs: 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });
const exportQuerySchema = historyQuerySchema.omit({ page: true, pageSize: true });

router.get('/health', (_req, res) => res.json({ success: true, service: 'nse-top-gainers', timestamp: new Date().toISOString() }));
router.get('/market/top', topController);
router.get('/market/latest', latestController);
router.get('/market/history', validate({ query: historyQuerySchema }), historyController);
router.get('/market/history/export.csv', validate({ query: exportQuerySchema }), historyCsvController);
router.get('/market/history/export.json', validate({ query: exportQuerySchema }), historyJsonController);
router.get('/market/history/:symbol', validate({ params: symbolParamsSchema }), symbolHistoryController);
router.post('/market/refresh', refreshLimiter, manualRefreshController);
router.get('/market/status', statusController);
router.get('/settings', getSettingsController);
router.put('/settings', writeLimiter, validate({ body: settingsSchema }), putSettingsController);

export default router;
