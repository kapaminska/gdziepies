import type {
  AnimalSpecies,
  AnimalSize,
  AnimalAgeRange,
  AnnouncementType,
  AnnouncementStatus,
} from '../types';

/**
 * State of filters for announcement search.
 */
export interface FilterState {
  /** Type of announcement: 'lost' or 'found' */
  announcement_type?: AnnouncementType;
  /** Animal species: 'dog' or 'cat' */
  species?: AnimalSpecies;
  /** Voivodeship name */
  voivodeship?: string;
  /** Poviat (county) name */
  poviat?: string;
  /** Animal size: 'small', 'medium', or 'large' */
  size?: AnimalSize;
  /** Color (free text search) */
  color?: string;
  /** Age range: 'young', 'adult', or 'senior' */
  age_range?: AnimalAgeRange;
  /** Start date for event_date filter */
  date_from?: Date;
  /** End date for event_date filter */
  date_to?: Date;
  /** Announcement status: 'active' or 'resolved' (defaults to 'active') */
  status?: AnnouncementStatus;
}

/**
 * Pagination state.
 */
export interface PaginationState {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items */
  total: number;
}

/**
 * Parameters for fetching announcements from API.
 * Extends FilterState with pagination parameters.
 */
export interface FetchAnnouncementsParams extends FilterState {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Field to order by (defaults to 'created_at') */
  order_by?: 'created_at' | 'event_date';
  /** Sort order: 'asc' or 'desc' (defaults to 'desc') */
  order?: 'asc' | 'desc';
}

