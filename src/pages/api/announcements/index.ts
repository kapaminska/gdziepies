import type { APIContext } from 'astro';

import { createdResponse, paginatedResponse } from '../../../lib/api-response';
import { handleApiError, UnauthorizedError, ValidationError } from '../../../lib/errors';
import { AnnouncementService } from '../../../lib/services/announcement.service';
import {
  createAnnouncementSchema,
  getAnnouncementsQuerySchema,
} from '../../../lib/validators/announcements';

export const prerender = false;

/**
 * GET /api/announcements
 * Retrieves a paginated list of announcements with optional filtering.
 * Public endpoint - no authentication required.
 */
export async function GET(context: APIContext) {
  try {
    // Parse and validate query parameters
    const queryParams = Object.fromEntries(context.url.searchParams);
    const validatedParams = getAnnouncementsQuerySchema.safeParse(queryParams);

    if (!validatedParams.success) {
      const fieldErrors = validatedParams.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Nieprawidłowe dane wejściowe', fieldErrors);
    }

    // Get announcements from service
    const result = await AnnouncementService.getAnnouncements(
      validatedParams.data,
      context.locals.supabase
    );

    // Return paginated response
    return paginatedResponse(result.data, result.pagination);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/announcements
 * Creates a new announcement.
 * Requires authentication.
 */
export async function POST(context: APIContext) {
  try {
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await context.locals.supabase.auth.getUser();

    if (authError || !user) {
      throw new UnauthorizedError();
    }

    // Parse and validate request body
    const body = await context.request.json();
    const validatedBody = createAnnouncementSchema.safeParse(body);

    if (!validatedBody.success) {
      const fieldErrors = validatedBody.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Nieprawidłowe dane wejściowe', fieldErrors);
    }

    // Create announcement
    const announcement = await AnnouncementService.createAnnouncement(
      validatedBody.data,
      user.id,
      context.locals.supabase
    );

    // Return created response
    return createdResponse(announcement);
  } catch (error) {
    return handleApiError(error);
  }
}

