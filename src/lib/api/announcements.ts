import type { AnnouncementDto } from '../../types';
import type { FetchAnnouncementsParams } from '../../types/announcement-filters';

/**
 * Response from the announcements API.
 */
export interface AnnouncementsApiResponse {
  data: AnnouncementDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Format a Date object to ISO date string (YYYY-MM-DD).
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Build query string from filter parameters.
 */
export function buildQueryString(params: FetchAnnouncementsParams): string {
  const searchParams = new URLSearchParams();

  // Map filter state to API query parameters
  if (params.announcement_type) {
    searchParams.append('type', params.announcement_type);
  }
  if (params.species) {
    searchParams.append('species', params.species);
  }
  if (params.voivodeship) {
    searchParams.append('voivodeship', params.voivodeship);
  }
  if (params.poviat) {
    searchParams.append('poviat', params.poviat);
  }
  if (params.size) {
    searchParams.append('size', params.size);
  }
  if (params.color) {
    searchParams.append('color', params.color);
  }
  if (params.age_range) {
    searchParams.append('age_range', params.age_range);
  }
  if (params.date_from) {
    searchParams.append('event_date_from', formatDate(params.date_from));
  }
  if (params.date_to) {
    searchParams.append('event_date_to', formatDate(params.date_to));
  }
  if (params.status) {
    searchParams.append('status', params.status);
  }

  // Pagination
  searchParams.append('page', String(params.page));
  searchParams.append('limit', String(params.pageSize));

  // Sorting
  if (params.order_by) {
    searchParams.append('order_by', params.order_by);
  }
  if (params.order) {
    searchParams.append('order', params.order);
  }

  return searchParams.toString();
}

/**
 * Fetch announcements from the API with filtering and pagination.
 *
 * @param params - Filter and pagination parameters
 * @returns Promise with announcements data and pagination info
 * @throws Error if the API request fails
 */
export async function fetchAnnouncements(
  params: FetchAnnouncementsParams
): Promise<AnnouncementsApiResponse> {
  const queryString = buildQueryString(params);
  const url = `/api/announcements?${queryString}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `API request failed with status ${response.status}`
    );
  }

  const data: AnnouncementsApiResponse = await response.json();
  return data;
}

