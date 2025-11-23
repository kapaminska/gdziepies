import { z } from 'zod';

import { uuidSchema } from './common';

/**
 * Schema for validating query parameters for GET /api/comments.
 * Requires announcement_id and optional order parameter.
 */
export const getCommentsQuerySchema = z.object({
  announcement_id: uuidSchema,
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});

/**
 * Schema for validating request body for POST /api/comments.
 * Requires announcement_id and content, optional is_sighting flag.
 */
export const addCommentSchema = z.object({
  announcement_id: uuidSchema,
  content: z
    .string()
    .min(1, 'Treść komentarza nie może być pusta')
    .max(5000, 'Treść komentarza nie może przekraczać 5000 znaków')
    .trim(),
  is_sighting: z.boolean().optional().default(false),
});

/**
 * Type inference from schemas.
 */
export type GetCommentsQuery = z.infer<typeof getCommentsQuerySchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;

