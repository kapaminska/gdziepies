import { z } from 'zod';

import type {
  AnimalAgeRange,
  AnimalSize,
  AnimalSpecies,
  AnnouncementStatus,
  AnnouncementType,
} from '../../types';

/**
 * Schema for validating announcement ID (UUID v4).
 */
export const announcementIdSchema = z.string().uuid({
  message: 'Nieprawidłowy format ID',
});

/**
 * Schema for validating announcement type enum.
 */
const announcementTypeSchema = z.enum(['lost', 'found'], {
  errorMap: () => ({
    message: "Typ musi być 'lost' lub 'found'",
  }),
});

/**
 * Schema for validating animal species enum.
 */
const animalSpeciesSchema = z.enum(['dog', 'cat'], {
  errorMap: () => ({
    message: "Gatunek musi być 'dog' lub 'cat'",
  }),
});

/**
 * Schema for validating animal size enum.
 */
const animalSizeSchema = z.enum(['small', 'medium', 'large'], {
  errorMap: () => ({
    message: "Rozmiar musi być 'small', 'medium' lub 'large'",
  }),
});

/**
 * Schema for validating animal age range enum.
 */
const animalAgeRangeSchema = z.enum(['young', 'adult', 'senior'], {
  errorMap: () => ({
    message: "Przedział wiekowy musi być 'young', 'adult' lub 'senior'",
  }),
});

/**
 * Schema for validating announcement status enum.
 */
const announcementStatusSchema = z.enum(['active', 'resolved'], {
  errorMap: () => ({
    message: "Status musi być 'active' lub 'resolved'",
  }),
});

/**
 * Schema for validating ISO date string (YYYY-MM-DD).
 */
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Data musi być w formacie YYYY-MM-DD',
});

/**
 * Schema for validating query parameters for GET /api/announcements.
 */
export const getAnnouncementsQuerySchema = z
  .object({
    type: announcementTypeSchema.optional(),
    species: animalSpeciesSchema.optional(),
    voivodeship: z.string().optional(),
    poviat: z.string().optional(),
    size: animalSizeSchema.optional(),
    color: z.string().max(50).optional(),
    age_range: animalAgeRangeSchema.optional(),
    event_date_from: isoDateSchema.optional(),
    event_date_to: isoDateSchema.optional(),
    status: announcementStatusSchema.optional().default('active'),
    author_id: z
      .string()
      .uuid({ message: 'Nieprawidłowy identyfikator użytkownika' })
      .optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().int().min(1).default(1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20))
      .pipe(z.number().int().min(1).max(100).default(20)),
    order_by: z.enum(['created_at', 'event_date']).optional().default('created_at'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  })
  .refine(
    (data) => {
      if (data.event_date_from && data.event_date_to) {
        return data.event_date_from <= data.event_date_to;
      }
      return true;
    },
    {
      message: 'Data zdarzenia "od" musi być wcześniejsza lub równa dacie "do"',
      path: ['event_date_from'],
    }
  );

/**
 * Schema for validating request body for POST /api/announcements.
 * Required fields: title, species, voivodeship, poviat, event_date, image_url
 */
export const createAnnouncementSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: 'Tytuł musi mieć co najmniej 3 znaki' })
      .max(200, { message: 'Tytuł nie może przekraczać 200 znaków' })
      .trim(),
    type: announcementTypeSchema,
    species: animalSpeciesSchema,
    voivodeship: z.string().min(1, { message: 'Województwo jest wymagane' }).trim(),
    poviat: z.string().min(1, { message: 'Powiat jest wymagany' }).trim(),
    event_date: isoDateSchema,
    image_url: z.string().url({ message: 'Nieprawidłowy format URL zdjęcia' }),
    location_details: z.string().max(500, { message: 'Szczegóły lokalizacji nie mogą przekraczać 500 znaków' }).trim().optional(),
    size: animalSizeSchema.optional(),
    color: z.string().max(50, { message: 'Kolor nie może przekraczać 50 znaków' }).trim().optional(),
    age_range: animalAgeRangeSchema.optional(),
    description: z.string().max(2000, { message: 'Opis nie może przekraczać 2000 znaków' }).trim().optional(),
    special_marks: z.string().max(500, { message: 'Znaki szczególne nie mogą przekraczać 500 znaków' }).trim().optional(),
    is_aggressive: z.boolean().optional().default(false),
    is_fearful: z.boolean().optional().default(false),
  })
  .strict();

/**
 * Schema for validating request body for PATCH /api/announcements/{id}.
 * All fields are optional (partial update).
 */
export const updateAnnouncementSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: 'Tytuł musi mieć co najmniej 3 znaki' })
      .max(200, { message: 'Tytuł nie może przekraczać 200 znaków' })
      .trim()
      .optional(),
    type: announcementTypeSchema.optional(),
    species: animalSpeciesSchema.optional(),
    voivodeship: z.string().min(1, { message: 'Województwo jest wymagane' }).trim().optional(),
    poviat: z.string().min(1, { message: 'Powiat jest wymagany' }).trim().optional(),
    event_date: isoDateSchema.optional(),
    image_url: z.string().url({ message: 'Nieprawidłowy format URL zdjęcia' }).optional(),
    location_details: z.string().max(500, { message: 'Szczegóły lokalizacji nie mogą przekraczać 500 znaków' }).trim().optional(),
    size: animalSizeSchema.optional().nullable(),
    color: z.string().max(50, { message: 'Kolor nie może przekraczać 50 znaków' }).trim().optional().nullable(),
    age_range: animalAgeRangeSchema.optional().nullable(),
    description: z.string().max(2000, { message: 'Opis nie może przekraczać 2000 znaków' }).trim().optional().nullable(),
    special_marks: z.string().max(500, { message: 'Znaki szczególne nie mogą przekraczać 500 znaków' }).trim().optional().nullable(),
    is_aggressive: z.boolean().optional(),
    is_fearful: z.boolean().optional(),
    status: announcementStatusSchema.optional(),
  })
  .strict();

/**
 * Type inference from schemas.
 */
export type GetAnnouncementsQuery = z.infer<typeof getAnnouncementsQuerySchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;

