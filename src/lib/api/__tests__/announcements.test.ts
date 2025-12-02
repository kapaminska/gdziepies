import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, buildQueryString, fetchAnnouncements } from '../announcements';
import type { FetchAnnouncementsParams } from '../../../types/announcement-filters';

describe('formatDate', () => {
  it('should format Date to YYYY-MM-DD', () => {
    const date = new Date(2024, 0, 15); // January 15, 2024
    const result = formatDate(date);
    expect(result).toBe('2024-01-15');
  });

  it('should pad month with leading zero', () => {
    const date = new Date(2024, 0, 1); // January 1, 2024
    const result = formatDate(date);
    expect(result).toBe('2024-01-01');
  });

  it('should pad day with leading zero', () => {
    const date = new Date(2024, 0, 5); // January 5, 2024
    const result = formatDate(date);
    expect(result).toBe('2024-01-05');
  });

  it('should handle dates at start of year', () => {
    const date = new Date(2024, 0, 1); // January 1, 2024
    const result = formatDate(date);
    expect(result).toBe('2024-01-01');
  });

  it('should handle dates at end of year', () => {
    const date = new Date(2024, 11, 31); // December 31, 2024
    const result = formatDate(date);
    expect(result).toBe('2024-12-31');
  });

  it('should handle dates at start of month', () => {
    const date = new Date(2024, 5, 1); // June 1, 2024
    const result = formatDate(date);
    expect(result).toBe('2024-06-01');
  });

  it('should handle dates at end of month', () => {
    const date = new Date(2024, 0, 31); // January 31, 2024
    const result = formatDate(date);
    expect(result).toBe('2024-01-31');
  });

  it('should handle February 29 (leap year)', () => {
    const date = new Date(2024, 1, 29); // February 29, 2024 (leap year)
    const result = formatDate(date);
    expect(result).toBe('2024-02-29');
  });

  it('should handle different years', () => {
    const dates = [
      new Date(2020, 5, 15),
      new Date(2023, 5, 15),
      new Date(2024, 5, 15),
      new Date(2025, 5, 15),
    ];
    const expected = ['2020-06-15', '2023-06-15', '2024-06-15', '2025-06-15'];
    dates.forEach((date, index) => {
      expect(formatDate(date)).toBe(expected[index]);
    });
  });

  it('should handle months correctly (0-indexed)', () => {
    // JavaScript Date months are 0-indexed (0 = January, 11 = December)
    const january = new Date(2024, 0, 15);
    const december = new Date(2024, 11, 15);
    expect(formatDate(january)).toBe('2024-01-15');
    expect(formatDate(december)).toBe('2024-12-15');
  });
});

describe('buildQueryString', () => {
  it('should build query string with all parameters', () => {
    const params: FetchAnnouncementsParams = {
      announcement_type: 'lost',
      species: 'dog',
      voivodeship: 'Mazowieckie',
      poviat: 'Warszawa',
      size: 'medium',
      color: 'Brown',
      age_range: 'adult',
      date_from: new Date(2024, 0, 1),
      date_to: new Date(2024, 0, 31),
      status: 'active',
      page: 1,
      pageSize: 20,
      order_by: 'created_at',
      order: 'desc',
    };
    const result = buildQueryString(params);
    const searchParams = new URLSearchParams(result);
    expect(searchParams.get('type')).toBe('lost');
    expect(searchParams.get('species')).toBe('dog');
    expect(searchParams.get('voivodeship')).toBe('Mazowieckie');
    expect(searchParams.get('poviat')).toBe('Warszawa');
    expect(searchParams.get('size')).toBe('medium');
    expect(searchParams.get('color')).toBe('Brown');
    expect(searchParams.get('age_range')).toBe('adult');
    expect(searchParams.get('event_date_from')).toBe('2024-01-01');
    expect(searchParams.get('event_date_to')).toBe('2024-01-31');
    expect(searchParams.get('status')).toBe('active');
    expect(searchParams.get('page')).toBe('1');
    expect(searchParams.get('limit')).toBe('20');
    expect(searchParams.get('order_by')).toBe('created_at');
    expect(searchParams.get('order')).toBe('desc');
  });

  it('should include only provided optional parameters', () => {
    const params: FetchAnnouncementsParams = {
      page: 1,
      pageSize: 20,
    };
    const result = buildQueryString(params);
    const searchParams = new URLSearchParams(result);
    expect(searchParams.get('page')).toBe('1');
    expect(searchParams.get('limit')).toBe('20');
    expect(searchParams.get('type')).toBeNull();
    expect(searchParams.get('species')).toBeNull();
    expect(searchParams.get('voivodeship')).toBeNull();
  });

  it('should format dates correctly', () => {
    const params: FetchAnnouncementsParams = {
      date_from: new Date(2024, 0, 15),
      date_to: new Date(2024, 5, 20),
      page: 1,
      pageSize: 20,
    };
    const result = buildQueryString(params);
    const searchParams = new URLSearchParams(result);
    expect(searchParams.get('event_date_from')).toBe('2024-01-15');
    expect(searchParams.get('event_date_to')).toBe('2024-06-20');
  });

  it('should include pagination parameters', () => {
    const params: FetchAnnouncementsParams = {
      page: 5,
      pageSize: 50,
    };
    const result = buildQueryString(params);
    const searchParams = new URLSearchParams(result);
    expect(searchParams.get('page')).toBe('5');
    expect(searchParams.get('limit')).toBe('50');
  });

  it('should include sorting parameters when provided', () => {
    const params: FetchAnnouncementsParams = {
      page: 1,
      pageSize: 20,
      order_by: 'event_date',
      order: 'asc',
    };
    const result = buildQueryString(params);
    const searchParams = new URLSearchParams(result);
    expect(searchParams.get('order_by')).toBe('event_date');
    expect(searchParams.get('order')).toBe('asc');
  });

  it('should omit sorting parameters when not provided', () => {
    const params: FetchAnnouncementsParams = {
      page: 1,
      pageSize: 20,
    };
    const result = buildQueryString(params);
    const searchParams = new URLSearchParams(result);
    expect(searchParams.get('order_by')).toBeNull();
    expect(searchParams.get('order')).toBeNull();
  });

  it('should handle single filter parameter', () => {
    const params: FetchAnnouncementsParams = {
      announcement_type: 'found',
      page: 1,
      pageSize: 20,
    };
    const result = buildQueryString(params);
    const searchParams = new URLSearchParams(result);
    expect(searchParams.get('type')).toBe('found');
  });

  it('should handle multiple filter parameters', () => {
    const params: FetchAnnouncementsParams = {
      announcement_type: 'lost',
      species: 'cat',
      size: 'small',
      page: 1,
      pageSize: 20,
    };
    const result = buildQueryString(params);
    const searchParams = new URLSearchParams(result);
    expect(searchParams.get('type')).toBe('lost');
    expect(searchParams.get('species')).toBe('cat');
    expect(searchParams.get('size')).toBe('small');
  });

  it('should handle date_from without date_to', () => {
    const params: FetchAnnouncementsParams = {
      date_from: new Date(2024, 0, 1),
      page: 1,
      pageSize: 20,
    };
    const result = buildQueryString(params);
    const searchParams = new URLSearchParams(result);
    expect(searchParams.get('event_date_from')).toBe('2024-01-01');
    expect(searchParams.get('event_date_to')).toBeNull();
  });

  it('should handle date_to without date_from', () => {
    const params: FetchAnnouncementsParams = {
      date_to: new Date(2024, 0, 31),
      page: 1,
      pageSize: 20,
    };
    const result = buildQueryString(params);
    const searchParams = new URLSearchParams(result);
    expect(searchParams.get('event_date_from')).toBeNull();
    expect(searchParams.get('event_date_to')).toBe('2024-01-31');
  });

  it('should handle status parameter', () => {
    const params: FetchAnnouncementsParams = {
      status: 'resolved',
      page: 1,
      pageSize: 20,
    };
    const result = buildQueryString(params);
    const searchParams = new URLSearchParams(result);
    expect(searchParams.get('status')).toBe('resolved');
  });

  it('should return empty string for minimal params', () => {
    const params: FetchAnnouncementsParams = {
      page: 1,
      pageSize: 20,
    };
    const result = buildQueryString(params);
    expect(result).toBe('page=1&limit=20');
  });

  it('should URL encode special characters', () => {
    const params: FetchAnnouncementsParams = {
      voivodeship: 'Mazowieckie',
      poviat: 'Ostrów Mazowiecka',
      color: 'Brown & White',
      page: 1,
      pageSize: 20,
    };
    const result = buildQueryString(params);
    const searchParams = new URLSearchParams(result);
    expect(searchParams.get('voivodeship')).toBe('Mazowieckie');
    expect(searchParams.get('poviat')).toBe('Ostrów Mazowiecka');
    expect(searchParams.get('color')).toBe('Brown & White');
  });
});

describe('fetchAnnouncements', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should build correct URL with query string', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    const params: FetchAnnouncementsParams = {
      announcement_type: 'lost',
      page: 1,
      pageSize: 20,
    };

    await fetchAnnouncements(params);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/announcements?'),
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('should return announcements data on success', async () => {
    const mockData = {
      data: [
        {
          id: '123',
          title: 'Test',
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    };
    const mockResponse = {
      ok: true,
      json: async () => mockData,
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    const result = await fetchAnnouncements({
      page: 1,
      pageSize: 20,
    });

    expect(result).toEqual(mockData);
  });

  it('should throw error when response is not ok', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found' }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await expect(
      fetchAnnouncements({
        page: 1,
        pageSize: 20,
      })
    ).rejects.toThrow('Not found');
  });

  it('should throw error with status code when response has no message', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: async () => ({}),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await expect(
      fetchAnnouncements({
        page: 1,
        pageSize: 20,
      })
    ).rejects.toThrow('API request failed with status 500');
  });

  it('should handle JSON parse error gracefully', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await expect(
      fetchAnnouncements({
        page: 1,
        pageSize: 20,
      })
    ).rejects.toThrow('API request failed with status 500');
  });
});



