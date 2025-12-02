import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../db/database.types';
import { ConflictError, NotFoundError } from '../errors';
import type { CreateReportCommand } from '../../types';

type SupabaseClientType = SupabaseClient<Database>;

/**
 * Service for managing reports.
 * Handles all database operations related to reports.
 */
export class ReportsService {
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
   * Creates a new report for an announcement.
   * Requires authentication - reporting_user_id is injected from the session.
   */
  static async createReport(
    command: CreateReportCommand,
    userId: string,
    supabaseClient: SupabaseClientType
  ): Promise<Database['public']['Tables']['reports']['Row']> {
    // Verify that the announcement exists
    await this.verifyAnnouncementExists(command.announcement_id, supabaseClient);

    // Map command to database insert format
    const insertData = {
      announcement_id: command.announcement_id,
      reason: command.reason ?? null,
      reporting_user_id: userId,
    };

    const { data, error } = await supabaseClient
      .from('reports')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation (user already reported this announcement)
      if (error.code === '23505') {
        throw new ConflictError('Już zgłosiłeś to ogłoszenie');
      }
      // Handle foreign key constraint violations
      if (error.code === '23503') {
        throw new NotFoundError('Ogłoszenie', command.announcement_id);
      }
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create report');
    }

    return data;
  }
}

