import { z } from 'zod';

import { uuidSchema } from './common';

/**
 * Schema for validating request body for POST /api/reports.
 * Requires announcement_id and reason.
 */
export const createReportSchema = z.object({
  announcement_id: uuidSchema,
  reason: z
    .string()
    .min(1, 'Powód zgłoszenia nie może być pusty')
    .max(1000, 'Powód zgłoszenia nie może przekraczać 1000 znaków')
    .trim(),
});

/**
 * Type inference from schemas.
 */
export type CreateReportInput = z.infer<typeof createReportSchema>;



