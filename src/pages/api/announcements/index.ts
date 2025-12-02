import type { APIContext } from 'astro';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '../../../db/database.types';
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
    // Get token from Authorization header
    const authHeader = context.request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      throw new UnauthorizedError();
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      console.error('Empty token after parsing');
      throw new UnauthorizedError();
    }

    // Create a new client for this request
    const supabaseUrl = import.meta.env.SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.SUPABASE_KEY;
    
    const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // First, verify the token and get user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    if (authError) {
      console.error('Auth error when verifying token:', authError.message);
      throw new UnauthorizedError();
    }

    if (!user) {
      console.error('No user found after token verification');
      throw new UnauthorizedError();
    }

    // Set the session for database queries (RLS) - this ensures auth.uid() works
    await supabaseClient.auth.setSession({
      access_token: token,
      refresh_token: '',
    } as any);

    if (authError) {
      console.error('Auth error:', authError);
      throw new UnauthorizedError();
    }

    if (!user) {
      console.error('No user found');
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

    // Create announcement using the authenticated client
    const announcement = await AnnouncementService.createAnnouncement(
      validatedBody.data,
      user.id,
      supabaseClient
    );

    // Return created response
    return createdResponse(announcement);
  } catch (error) {
    return handleApiError(error);
  }
}


