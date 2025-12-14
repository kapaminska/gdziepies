import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../db/database.types';
import { ConflictError, ForbiddenError, NotFoundError } from '../errors';
import type {
  AnnouncementDto,
  CreateAnnouncementCommand,
  UpdateAnnouncementCommand,
} from '../../types';
import type { GetAnnouncementsQuery } from '../validators/announcements';

type SupabaseClientType = SupabaseClient<Database>;

/**
 * Service for managing announcements.
 * Handles all database operations related to announcements.
 */
export class AnnouncementService {
  /**
   * Retrieves a paginated list of announcements with optional filtering.
   */
  static async getAnnouncements(
    queryParams: GetAnnouncementsQuery,
    supabaseClient: SupabaseClientType
  ): Promise<{
    data: AnnouncementDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { page, limit, order_by, order, ...filters } = queryParams;

    // Build the query
    // Use left join to profiles_public view to get author information
    let query = supabaseClient
      .from('announcements')
      .select('*,profiles_public!announcements_author_id_fkey(id,username,avatar_url,created_at)', { count: 'exact' });

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.species) {
      query = query.eq('species', filters.species);
    }
    if (filters.voivodeship) {
      query = query.eq('voivodeship', filters.voivodeship);
    }
    if (filters.poviat) {
      query = query.eq('poviat', filters.poviat);
    }
    if (filters.size) {
      query = query.eq('size', filters.size);
    }
    if (filters.color) {
      query = query.ilike('color', `%${filters.color}%`);
    }
    if (filters.age_range) {
      query = query.eq('age_range', filters.age_range);
    }
    if (filters.event_date_from) {
      query = query.gte('event_date', filters.event_date_from);
    }
    if (filters.event_date_to) {
      query = query.lte('event_date', filters.event_date_to);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.author_id) {
      query = query.eq('author_id', filters.author_id);
    }

    // Apply sorting
    query = query.order(order_by, { ascending: order === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Transform data to match AnnouncementDto structure
    // Supabase returns joined data in nested structure: { ...announcement, profiles_public: {...} }
    const announcements: AnnouncementDto[] = data.map((announcement: any) => {
      const { profiles_public, ...announcementData } = announcement;
      return {
        ...announcementData,
        author: profiles_public
          ? {
              id: profiles_public.id,
              username: profiles_public.username,
              avatar_url: profiles_public.avatar_url,
              created_at: profiles_public.created_at,
            }
          : null,
      };
    });

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: announcements,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Retrieves a single announcement by ID.
   */
  static async getAnnouncementById(
    id: string,
    supabaseClient: SupabaseClientType
  ): Promise<AnnouncementDto> {
    const { data, error } = await supabaseClient
      .from('announcements')
      .select('*,profiles_public!announcements_author_id_fkey(id,username,avatar_url,created_at)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        throw new NotFoundError('Ogłoszenie', id);
      }
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundError('Ogłoszenie', id);
    }

    // Transform data to match AnnouncementDto structure
    // Supabase returns joined data in nested structure: { ...announcement, profiles_public: {...} }
    const { profiles_public, ...announcementData } = data as any;
    return {
      ...announcementData,
      author: profiles_public
        ? {
            id: profiles_public.id,
            username: profiles_public.username,
            avatar_url: profiles_public.avatar_url,
            created_at: profiles_public.created_at,
          }
        : null,
    };
  }

  /**
   * Creates a new announcement.
   */
  static async createAnnouncement(
    command: CreateAnnouncementCommand,
    userId: string,
    supabaseClient: SupabaseClientType
  ): Promise<AnnouncementDto> {
    // Map command to database insert format
    const insertData = {
      ...command,
      author_id: userId,
      status: 'active' as const,
      is_aggressive: command.is_aggressive ?? false,
      is_fearful: command.is_fearful ?? false,
    };

    const { data, error } = await supabaseClient
      .from('announcements')
      .insert(insertData)
      .select('*,profiles_public!announcements_author_id_fkey(id,username,avatar_url,created_at)')
      .single();

    if (error) {
      // Handle unique constraint violations or other database errors
      if (error.code === '23505') {
        throw new ConflictError('Ogłoszenie już istnieje');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create announcement');
    }

    // Transform data to match AnnouncementDto structure
    // Supabase returns joined data in nested structure: { ...announcement, profiles_public: {...} }
    const { profiles_public, ...announcementData } = data as any;
    return {
      ...announcementData,
      author: profiles_public
        ? {
            id: profiles_public.id,
            username: profiles_public.username,
            avatar_url: profiles_public.avatar_url,
            created_at: profiles_public.created_at,
          }
        : null,
    };
  }

  /**
   * Updates an existing announcement.
   * Only the author can update their own announcement.
   */
  static async updateAnnouncement(
    id: string,
    command: UpdateAnnouncementCommand,
    userId: string,
    supabaseClient: SupabaseClientType
  ): Promise<AnnouncementDto> {
    // First, check if announcement exists and user is the author
    const existing = await this.getAnnouncementById(id, supabaseClient);

    if (existing.author_id !== userId) {
      throw new ForbiddenError();
    }

    // Prepare update data (remove undefined values)
    const updateData: Record<string, unknown> = {};
    Object.entries(command).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    // Update the announcement
    const { data, error } = await supabaseClient
      .from('announcements')
      .update(updateData)
      .eq('id', id)
      .select('*,profiles_public!announcements_author_id_fkey(id,username,avatar_url,created_at)')
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundError('Ogłoszenie', id);
    }

    // Transform data to match AnnouncementDto structure
    // Supabase returns joined data in nested structure: { ...announcement, profiles_public: {...} }
    const { profiles_public, ...announcementData } = data as any;
    return {
      ...announcementData,
      author: profiles_public
        ? {
            id: profiles_public.id,
            username: profiles_public.username,
            avatar_url: profiles_public.avatar_url,
            created_at: profiles_public.created_at,
          }
        : null,
    };
  }

  /**
   * Deletes an announcement.
   * Only the author can delete their own announcement.
   */
  static async deleteAnnouncement(
    id: string,
    userId: string,
    supabaseClient: SupabaseClientType
  ): Promise<void> {
    // First, check if announcement exists and user is the author
    const existing = await this.getAnnouncementById(id, supabaseClient);

    if (existing.author_id !== userId) {
      throw new ForbiddenError();
    }

    const { error } = await supabaseClient.from('announcements').delete().eq('id', id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
}

