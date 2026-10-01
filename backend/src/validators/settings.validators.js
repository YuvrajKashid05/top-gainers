import { z } from 'zod';
export const settingsSchema = z.object({ topN: z.coerce.number().int().min(5).max(100), minPrice: z.coerce.number().finite().min(0), historyDays: z.coerce.number().int().min(1).max(30), refreshInterval: z.coerce.number().int().refine(value => value === 5, 'Refresh interval is fixed at 5 minutes'), theme: z.enum(['light','dark','system']) });
