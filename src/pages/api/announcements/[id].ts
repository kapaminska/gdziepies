import type { APIContext } from 'astro';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '../../../db/database.types';
import { noContentResponse, successResponse } from '../../../lib/api-response';
import { handleApiError, UnauthorizedError, ValidationError } from '../../../lib/errors';
import { getSupabaseConfig } from '@/lib/supabase-config';
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
      console.error('Missing or invalid Authorization header');
      throw new UnauthorizedError();
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      console.error('Empty token after parsing');
      throw new UnauthorizedError();
    }

    // Create a new client for this request
    const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();
    
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

    // Update announcement using the authenticated client
    const announcement = await AnnouncementService.updateAnnouncement(
      validatedId.data,
      validatedBody.data,
      user.id,
      supabaseClient
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
      console.error('Missing or invalid Authorization header');
      throw new UnauthorizedError();
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      console.error('Empty token after parsing');
      throw new UnauthorizedError();
    }

    // Create a new client for this request
    const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();
    
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

    // Validate ID format (UUID)
    const validatedId = announcementIdSchema.safeParse(id);
    if (!validatedId.success) {
      throw new ValidationError('Nieprawidłowe dane wejściowe', [
        { field: 'id', message: 'Nieprawidłowy format ID' },
      ]);
    }

    // Delete announcement using the authenticated client
    await AnnouncementService.deleteAnnouncement(
      validatedId.data,
      user.id,
      supabaseClient
    );

    // Return no content response
    return noContentResponse();
  } catch (error) {
    return handleApiError(error);
  }
}


