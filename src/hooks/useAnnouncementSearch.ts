import { useEffect, useState, useCallback, useRef } from 'react';
import type { AnnouncementDto } from '@/types';
import type { FilterState, PaginationState } from '@/types/announcement-filters';
import { fetchAnnouncements } from '@/lib/api/announcements';

/**
 * Parse URL search params into FilterState.
 */
function parseUrlParams(): Partial<FilterState> {
  if (typeof window === 'undefined') {
    return {};
  }

  const searchParams = new URLSearchParams(window.location.search);
  const filters: Partial<FilterState> = {};

  // Parse announcement_type
  const type = searchParams.get('type');
  if (type === 'lost' || type === 'found') {
    filters.announcement_type = type;
  }

  // Parse species
  const species = searchParams.get('species');
  if (species === 'dog' || species === 'cat') {
    filters.species = species;
  }

  // Parse location
  const voivodeship = searchParams.get('voivodeship');
  if (voivodeship) {
    filters.voivodeship = voivodeship;
  }

  const poviat = searchParams.get('poviat');
  if (poviat) {
    filters.poviat = poviat;
  }

  // Parse size
  const size = searchParams.get('size');
  if (size === 'small' || size === 'medium' || size === 'large') {
    filters.size = size;
  }

  // Parse color (free text)
  const color = searchParams.get('color');
  if (color) {
    filters.color = color;
  }

  // Parse age_range
  const ageRange = searchParams.get('age_range');
  if (ageRange === 'young' || ageRange === 'adult' || ageRange === 'senior') {
    filters.age_range = ageRange;
  }

  // Parse dates
  const dateFrom = searchParams.get('date_from');
  if (dateFrom) {
    const date = new Date(dateFrom);
    if (!isNaN(date.getTime())) {
      filters.date_from = date;
    }
  }

  const dateTo = searchParams.get('date_to');
  if (dateTo) {
    const date = new Date(dateTo);
    if (!isNaN(date.getTime())) {
      filters.date_to = date;
    }
  }

  // Parse status
  const status = searchParams.get('status');
  if (status === 'active' || status === 'resolved') {
    filters.status = status;
  }

  return filters;
}

/**
 * Build URL search params from FilterState.
 */
function buildUrlParams(filters: FilterState, pagination: PaginationState): string {
  const params = new URLSearchParams();

  if (filters.announcement_type) {
    params.append('type', filters.announcement_type);
  }
  if (filters.species) {
    params.append('species', filters.species);
  }
  if (filters.voivodeship) {
    params.append('voivodeship', filters.voivodeship);
  }
  if (filters.poviat) {
    params.append('poviat', filters.poviat);
  }
  if (filters.size) {
    params.append('size', filters.size);
  }
  if (filters.color) {
    params.append('color', filters.color);
  }
  if (filters.age_range) {
    params.append('age_range', filters.age_range);
  }
  if (filters.date_from) {
    params.append('date_from', filters.date_from.toISOString().split('T')[0]);
  }
  if (filters.date_to) {
    params.append('date_to', filters.date_to.toISOString().split('T')[0]);
  }
  if (filters.status && filters.status !== 'active') {
    params.append('status', filters.status);
  }

  // Only add page if > 1
  if (pagination.page > 1) {
    params.append('page', String(pagination.page));
  }

  return params.toString();
}

/**
 * Update URL without page reload.
 */
function updateUrl(params: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const newUrl = params
    ? `${window.location.pathname}?${params}`
    : window.location.pathname;

  window.history.pushState({}, '', newUrl);
}

/**
 * Custom hook for announcement search with URL synchronization.
 */
export function useAnnouncementSearch() {
  const [filters, setFilters] = useState<FilterState>(() => {
    // Initialize from URL on mount
    const urlFilters = parseUrlParams();
    return {
      status: 'active',
      ...urlFilters,
    };
  });

  const [pagination, setPagination] = useState<PaginationState>(() => {
    // Initialize pagination from URL
    if (typeof window === 'undefined') {
      return { page: 1, pageSize: 20, total: 0 };
    }

    const searchParams = new URLSearchParams(window.location.search);
    const page = parseInt(searchParams.get('page') || '1', 10);
    return {
      page: isNaN(page) || page < 1 ? 1 : page,
      pageSize: 20,
      total: 0,
    };
  });

  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Debounce ref for color field
  const colorDebounceRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Update filters and sync with URL.
   */
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      // Remove undefined values
      Object.keys(updated).forEach((key) => {
        if (updated[key as keyof FilterState] === undefined) {
          delete updated[key as keyof FilterState];
        }
      });
      return updated;
    });
  }, []);

  /**
   * Update a single filter value.
   */
  const setFilter = useCallback(
    (key: keyof FilterState, value: string | Date | undefined) => {
      // Special handling for color field (debounce)
      if (key === 'color') {
        if (colorDebounceRef.current) {
          clearTimeout(colorDebounceRef.current);
        }

        colorDebounceRef.current = setTimeout(() => {
          updateFilters({ [key]: value as string | undefined });
        }, 400);
      } else {
        updateFilters({ [key]: value });
      }
    },
    [updateFilters]
  );

  /**
   * Clear all filters.
   */
  const clearFilters = useCallback(() => {
    setFilters({ status: 'active' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Fetch announcements from API.
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
        order_by: 'created_at',
        order: 'desc',
      };

      const response = await fetchAnnouncements(params);

      setAnnouncements(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.total,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch announcements'));
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  // Sync URL when filters or pagination changes
  useEffect(() => {
    const params = buildUrlParams(filters, pagination);
    updateUrl(params);
  }, [filters, pagination.page]);

  // Fetch data when filters or pagination changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const urlFilters = parseUrlParams();
      setFilters({
        status: 'active',
        ...urlFilters,
      });

      const searchParams = new URLSearchParams(window.location.search);
      const page = parseInt(searchParams.get('page') || '1', 10);
      setPagination((prev) => ({
        ...prev,
        page: isNaN(page) || page < 1 ? 1 : page,
      }));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    filters,
    pagination,
    announcements,
    isLoading,
    error,
    setFilter,
    clearFilters,
    setPagination,
    refetch: fetchData,
  };
}

