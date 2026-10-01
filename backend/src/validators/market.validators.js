import { z } from "zod";

export const historyQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  symbol: z.string().trim().max(40).optional(),
  rank: z.coerce.number().int().min(1).max(100).optional(),
  topN: z.coerce.number().int().min(5).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(200).default(50),
});
export const symbolParamsSchema = z.object({
  symbol: z.string().trim().min(1).max(40),
});
