import type { APIContext } from 'astro';

import { createdResponse } from '../../../lib/api-response';
import { handleApiError, UnauthorizedError, ValidationError } from '../../../lib/errors';
import { CommentsService } from '../../../lib/services/comments.service';
import {
  addCommentSchema,
  getCommentsQuerySchema,
} from '../../../lib/validators/comments';

export const prerender = false;

/**
 * GET /api/comments
 * Retrieves all comments for a specific announcement.
 * Public endpoint - no authentication required.
 *
 * Query parameters:
 * - announcement_id (required): UUID of the announcement
 * - order (optional): 'asc' or 'desc' - sort order by creation date (default: 'asc')
 *
 * Returns:
 * - 200 OK: List of comments with metadata
 * - 400 Bad Request: Invalid query parameters
 * - 500 Internal Server Error: Server error
 */
export async function GET(context: APIContext) {
  try {
    // Parse and validate query parameters
    const queryParams = Object.fromEntries(context.url.searchParams);
    const validatedParams = getCommentsQuerySchema.safeParse(queryParams);

    if (!validatedParams.success) {
      const fieldErrors = validatedParams.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Nieprawidłowe dane wejściowe', fieldErrors);
    }

    // Get comments from service
    const comments = await CommentsService.getCommentsByAnnouncementId(
      validatedParams.data.announcement_id,
      validatedParams.data.order,
      context.locals.supabase
    );

    // Return response with data and metadata
    return new Response(
      JSON.stringify({
        data: comments,
        meta: {
          count: comments.length,
          announcement_id: validatedParams.data.announcement_id,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/comments
 * Creates a new comment for an announcement.
 * Requires authentication.
 *
 * Request body:
 * - announcement_id (required): UUID of the announcement
 * - content (required): Comment text (1-5000 characters)
 * - is_sighting (optional): Boolean flag indicating if comment is a sighting report (default: false)
 *
 * Returns:
 * - 201 Created: Created comment with author information
 * - 400 Bad Request: Invalid request body
 * - 401 Unauthorized: Missing or invalid authentication
 * - 404 Not Found: Announcement not found
 * - 409 Conflict: Cannot add comment to non-existent announcement
 * - 500 Internal Server Error: Server error
 */
export async function POST(context: APIContext) {
  try {
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

    // Parse and validate request body
    const body = await context.request.json();
    const validatedBody = addCommentSchema.safeParse(body);

    if (!validatedBody.success) {
      const fieldErrors = validatedBody.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Nieprawidłowe dane wejściowe', fieldErrors);
    }

    // Create comment
    const comment = await CommentsService.createComment(
      validatedBody.data,
      user.id,
      context.locals.supabase
    );

    // Return created response
    return createdResponse(comment);
  } catch (error) {
    return handleApiError(error);
  }
}


