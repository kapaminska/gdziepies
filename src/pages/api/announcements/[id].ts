import type { APIContext } from 'astro';

import { noContentResponse, successResponse } from '../../../lib/api-response';
import { handleApiError, UnauthorizedError, ValidationError } from '../../../lib/errors';
import { AnnouncementService } from '../../../lib/services/announcement.service';
import {
  announcementIdSchema,
  updateAnnouncementSchema,
} from '../../../lib/validators/announcements';

export const prerender = false;

/**
 * GET /api/announcements/{id}
 * Retrieves a single announcement by ID.
 * Public endpoint - no authentication required.
 */
export async function GET(context: APIContext) {
  try {
    const { id } = context.params;

    if (!id) {
      throw new ValidationError('Nieprawidłowe dane wejściowe', [
        { field: 'id', message: 'ID jest wymagane' },
      ]);
    }

    // Validate ID format (UUID)
    const validatedId = announcementIdSchema.safeParse(id);
    if (!validatedId.success) {
      throw new ValidationError('Nieprawidłowe dane wejściowe', [
        { field: 'id', message: 'Nieprawidłowy format ID' },
      ]);
    }

    // Get announcement from service
    const announcement = await AnnouncementService.getAnnouncementById(
      validatedId.data,
      context.locals.supabase
    );

    // Return success response
    return successResponse(announcement);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/announcements/{id}
 * Updates an existing announcement.
 * Requires authentication. Only the author can update their announcement.
 */
export async function PATCH(context: APIContext) {
  try {
    const { id } = context.params;

    if (!id) {
      throw new ValidationError('Nieprawidłowe dane wejściowe', [
        { field: 'id', message: 'ID jest wymagane' },
      ]);
    }

    // Get token from Authorization header
    const authHeader = context.request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError();
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      throw new UnauthorizedError();
    }

    // Check authentication using the token
    const {
      data: { user },
      error: authError,
    } = await context.locals.supabase.auth.getUser(token);

    if (authError || !user) {
      throw new UnauthorizedError();
    }

    // Validate ID format (UUID)
    const validatedId = announcementIdSchema.safeParse(id);
    if (!validatedId.success) {
      throw new ValidationError('Nieprawidłowe dane wejściowe', [
        { field: 'id', message: 'Nieprawidłowy format ID' },
      ]);
    }

    // Parse and validate request body
    const body = await context.request.json();
    const validatedBody = updateAnnouncementSchema.safeParse(body);

    if (!validatedBody.success) {
      const fieldErrors = validatedBody.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Nieprawidłowe dane wejściowe', fieldErrors);
    }

    // Update announcement
    const announcement = await AnnouncementService.updateAnnouncement(
      validatedId.data,
      validatedBody.data,
      user.id,
      context.locals.supabase
    );

    // Return success response
    return successResponse(announcement);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/announcements/{id}
 * Deletes an announcement.
 * Requires authentication. Only the author can delete their announcement.
 */
export async function DELETE(context: APIContext) {
  try {
    const { id } = context.params;

    if (!id) {
      throw new ValidationError('Nieprawidłowe dane wejściowe', [
        { field: 'id', message: 'ID jest wymagane' },
      ]);
    }

    // Get token from Authorization header
    const authHeader = context.request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError();
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      throw new UnauthorizedError();
    }

    // Check authentication using the token
    const {
      data: { user },
      error: authError,
    } = await context.locals.supabase.auth.getUser(token);

    if (authError || !user) {
      throw new UnauthorizedError();
    }

    // Validate ID format (UUID)
    const validatedId = announcementIdSchema.safeParse(id);
    if (!validatedId.success) {
      throw new ValidationError('Nieprawidłowe dane wejściowe', [
        { field: 'id', message: 'Nieprawidłowy format ID' },
      ]);
    }

    // Delete announcement
    await AnnouncementService.deleteAnnouncement(
      validatedId.data,
      user.id,
      context.locals.supabase
    );

    // Return no content response
    return noContentResponse();
  } catch (error) {
    return handleApiError(error);
  }
}


