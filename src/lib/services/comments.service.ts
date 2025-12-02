import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../db/database.types';
import { ConflictError, NotFoundError } from '../errors';
import type { AddCommentCommand, CommentDto } from '../../types';

type SupabaseClientType = SupabaseClient<Database>;

/**
 * Service for managing comments.
 * Handles all database operations related to comments.
 */
export class CommentsService {
  /**
   * Retrieves all comments for a specific announcement.
   * Returns comments ordered by creation date (ascending or descending).
   */
  static async getCommentsByAnnouncementId(
    announcementId: string,
    order: 'asc' | 'desc' = 'asc',
    supabaseClient: SupabaseClientType
  ): Promise<CommentDto[]> {
    const { data, error } = await supabaseClient
      .from('comments')
      .select('*,profiles_public!comments_author_id_fkey(id,username,created_at)')
      .eq('announcement_id', announcementId)
      .order('created_at', { ascending: order === 'asc' });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Transform data to match CommentDto structure
    // Supabase returns joined data in nested structure: { ...comment, profiles_public: {...} }
    const comments: CommentDto[] = data.map((comment: any) => {
      const { profiles_public, ...commentData } = comment;
      return {
        ...commentData,
        author: profiles_public
          ? {
              id: profiles_public.id,
              username: profiles_public.username,
              created_at: profiles_public.created_at,
            }
          : null,
      };
    });

    return comments;
  }

  /**
   * Verifies that an announcement exists and is accessible.
   * Throws NotFoundError if announcement doesn't exist.
   */
  static async verifyAnnouncementExists(
    announcementId: string,
    supabaseClient: SupabaseClientType
  ): Promise<void> {
    const { data, error } = await supabaseClient
      .from('announcements')
      .select('id')
      .eq('id', announcementId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        throw new NotFoundError('Ogłoszenie', announcementId);
      }
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundError('Ogłoszenie', announcementId);
    }
  }

  /**
   * Creates a new comment for an announcement.
   * Requires authentication - author_id is injected from the session.
   */
  static async createComment(
    command: AddCommentCommand,
    userId: string,
    supabaseClient: SupabaseClientType
  ): Promise<CommentDto> {
    // Verify that the announcement exists
    await this.verifyAnnouncementExists(command.announcement_id, supabaseClient);

    // Map command to database insert format
    const insertData = {
      announcement_id: command.announcement_id,
      content: command.content,
      is_sighting: command.is_sighting ?? false,
      author_id: userId,
    };

    const { data, error } = await supabaseClient
      .from('comments')
      .insert(insertData)
      .select('*,profiles_public!comments_author_id_fkey(id,username,created_at)')
      .single();

    if (error) {
      // Handle foreign key constraint violations
      if (error.code === '23503') {
        throw new ConflictError('Nie można dodać komentarza do nieistniejącego ogłoszenia');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create comment');
    }

    // Transform data to match CommentDto structure
    // Supabase returns joined data in nested structure: { ...comment, profiles_public: {...} }
    const { profiles_public, ...commentData } = data as any;
    return {
      ...commentData,
      author: profiles_public
        ? {
            id: profiles_public.id,
            username: profiles_public.username,
            created_at: profiles_public.created_at,
          }
        : null,
    };
  }
}


