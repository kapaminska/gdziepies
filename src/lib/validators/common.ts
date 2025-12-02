import { z } from 'zod';

/**
 * Schema for validating UUID v4 format.
 * Used across multiple validators for consistent UUID validation.
 */
export const uuidSchema = z.string().uuid({
  message: 'Nieprawidłowy format UUID',
});


