import type { APIContext } from 'astro';

import { createdResponse } from '../../../lib/api-response';
import { handleApiError, UnauthorizedError, ValidationError } from '../../../lib/errors';
import { ReportsService } from '../../../lib/services/reports.service';
import { createReportSchema } from '../../../lib/validators/reports';

export const prerender = false;

/**
 * POST /api/reports
 * Creates a new report for an announcement.
 * Requires authentication.
 *
 * Request body:
 * - announcement_id (required): UUID of the announcement
 * - reason (required): Reason for reporting (1-1000 characters)
 *
 * Returns:
 * - 201 Created: Created report
 * - 400 Bad Request: Invalid request body
 * - 401 Unauthorized: Missing or invalid authentication
 * - 404 Not Found: Announcement not found
 * - 409 Conflict: User already reported this announcement
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
    const validatedBody = createReportSchema.safeParse(body);

    if (!validatedBody.success) {
      const fieldErrors = validatedBody.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Nieprawidłowe dane wejściowe', fieldErrors);
    }

    // Create report
    const report = await ReportsService.createReport(
      validatedBody.data,
      user.id,
      context.locals.supabase
    );

    // Return created response
    return createdResponse(report);
  } catch (error) {
    return handleApiError(error);
  }
}




