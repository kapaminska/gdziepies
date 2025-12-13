import { describe, it, expect } from 'vitest';
import {
  announcementIdSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  getAnnouncementsQuerySchema,
} from '../announcements';

describe('announcementIdSchema', () => {
  it('should accept valid UUID v4', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000';
    const result = announcementIdSchema.safeParse(validId);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(validId);
    }
  });

  it('should reject invalid UUID format', () => {
    const invalidId = 'not-a-uuid';
    const result = announcementIdSchema.safeParse(invalidId);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nieprawidłowy format ID');
    }
  });

  it('should reject empty string', () => {
    const result = announcementIdSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

describe('createAnnouncementSchema', () => {
  const validAnnouncement = {
    title: 'Zaginiony pies',
    type: 'lost' as const,
    species: 'dog' as const,
    voivodeship: 'Mazowieckie',
    poviat: 'Warszawa',
    event_date: '2024-01-15',
    image_url: 'https://example.com/image.jpg',
  };

  it('should accept valid announcement data', () => {
    const result = createAnnouncementSchema.safeParse(validAnnouncement);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Zaginiony pies');
      expect(result.data.is_aggressive).toBe(false);
      expect(result.data.is_fearful).toBe(false);
    }
  });

  it('should set default values for is_aggressive and is_fearful', () => {
    const result = createAnnouncementSchema.safeParse(validAnnouncement);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_aggressive).toBe(false);
      expect(result.data.is_fearful).toBe(false);
    }
  });

  it('should allow explicit boolean values for is_aggressive and is_fearful', () => {
    const data = {
      ...validAnnouncement,
      is_aggressive: true,
      is_fearful: true,
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_aggressive).toBe(true);
      expect(result.data.is_fearful).toBe(true);
    }
  });

  it('should reject title shorter than 3 characters', () => {
    const data = {
      ...validAnnouncement,
      title: 'Ab',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tytuł musi mieć co najmniej 3 znaki');
    }
  });

  it('should reject title longer than 200 characters', () => {
    const data = {
      ...validAnnouncement,
      title: 'A'.repeat(201),
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tytuł nie może przekraczać 200 znaków');
    }
  });

  it('should accept title with exactly 3 characters', () => {
    const data = {
      ...validAnnouncement,
      title: 'Abc',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept title with exactly 200 characters', () => {
    const data = {
      ...validAnnouncement,
      title: 'A'.repeat(200),
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should trim whitespace from title', () => {
    const data = {
      ...validAnnouncement,
      title: '  Zaginiony pies  ',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Zaginiony pies');
    }
  });

  it('should reject invalid type enum value', () => {
    const data = {
      ...validAnnouncement,
      type: 'invalid' as any,
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Typ musi być 'lost' lub 'found'");
    }
  });

  it('should accept type "lost"', () => {
    const data = {
      ...validAnnouncement,
      type: 'lost' as const,
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept type "found"', () => {
    const data = {
      ...validAnnouncement,
      type: 'found' as const,
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject invalid species enum value', () => {
    const data = {
      ...validAnnouncement,
      species: 'bird' as any,
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Gatunek musi być 'dog' lub 'cat'");
    }
  });

  it('should accept species "dog"', () => {
    const data = {
      ...validAnnouncement,
      species: 'dog' as const,
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept species "cat"', () => {
    const data = {
      ...validAnnouncement,
      species: 'cat' as const,
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject empty voivodeship', () => {
    const data = {
      ...validAnnouncement,
      voivodeship: '',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Województwo jest wymagane');
    }
  });

  it('should trim whitespace from voivodeship', () => {
    const data = {
      ...validAnnouncement,
      voivodeship: '  Mazowieckie  ',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.voivodeship).toBe('Mazowieckie');
    }
  });

  it('should reject empty poviat', () => {
    const data = {
      ...validAnnouncement,
      poviat: '',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Powiat jest wymagany');
    }
  });

  it('should trim whitespace from poviat', () => {
    const data = {
      ...validAnnouncement,
      poviat: '  Warszawa  ',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.poviat).toBe('Warszawa');
    }
  });

  it('should reject invalid date format', () => {
    const data = {
      ...validAnnouncement,
      event_date: '2024/01/15',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data musi być w formacie YYYY-MM-DD');
    }
  });

  it('should reject date without leading zeros', () => {
    const data = {
      ...validAnnouncement,
      event_date: '2024-1-5',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept valid date format YYYY-MM-DD', () => {
    const data = {
      ...validAnnouncement,
      event_date: '2024-01-15',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept date at start of year', () => {
    const data = {
      ...validAnnouncement,
      event_date: '2024-01-01',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept date at end of month', () => {
    const data = {
      ...validAnnouncement,
      event_date: '2024-01-31',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject invalid URL format', () => {
    const data = {
      ...validAnnouncement,
      image_url: 'not-a-url',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nieprawidłowy format URL zdjęcia');
    }
  });

  it('should accept valid HTTP URL', () => {
    const data = {
      ...validAnnouncement,
      image_url: 'http://example.com/image.jpg',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept valid HTTPS URL', () => {
    const data = {
      ...validAnnouncement,
      image_url: 'https://example.com/image.jpg',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept optional location_details with max 500 characters', () => {
    const data = {
      ...validAnnouncement,
      location_details: 'A'.repeat(500),
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject location_details longer than 500 characters', () => {
    const data = {
      ...validAnnouncement,
      location_details: 'A'.repeat(501),
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Szczegóły lokalizacji nie mogą przekraczać 500 znaków');
    }
  });

  it('should trim whitespace from location_details', () => {
    const data = {
      ...validAnnouncement,
      location_details: '  Some details  ',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.location_details).toBe('Some details');
    }
  });

  it('should accept optional size enum values', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    for (const size of sizes) {
      const data = {
        ...validAnnouncement,
        size,
      };
      const result = createAnnouncementSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid size enum value', () => {
    const data = {
      ...validAnnouncement,
      size: 'huge' as any,
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Rozmiar musi być 'small', 'medium' lub 'large'");
    }
  });

  it('should accept optional color with max 50 characters', () => {
    const data = {
      ...validAnnouncement,
      color: 'A'.repeat(50),
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject color longer than 50 characters', () => {
    const data = {
      ...validAnnouncement,
      color: 'A'.repeat(51),
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Kolor nie może przekraczać 50 znaków');
    }
  });

  it('should trim whitespace from color', () => {
    const data = {
      ...validAnnouncement,
      color: '  Brown  ',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.color).toBe('Brown');
    }
  });

  it('should accept optional age_range enum values', () => {
    const ageRanges = ['young', 'adult', 'senior'] as const;
    for (const ageRange of ageRanges) {
      const data = {
        ...validAnnouncement,
        age_range: ageRange,
      };
      const result = createAnnouncementSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid age_range enum value', () => {
    const data = {
      ...validAnnouncement,
      age_range: 'puppy' as any,
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Przedział wiekowy musi być 'young', 'adult' lub 'senior'");
    }
  });

  it('should accept optional description with max 2000 characters', () => {
    const data = {
      ...validAnnouncement,
      description: 'A'.repeat(2000),
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject description longer than 2000 characters', () => {
    const data = {
      ...validAnnouncement,
      description: 'A'.repeat(2001),
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Opis nie może przekraczać 2000 znaków');
    }
  });

  it('should trim whitespace from description', () => {
    const data = {
      ...validAnnouncement,
      description: '  Some description  ',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('Some description');
    }
  });

  it('should accept optional special_marks with max 500 characters', () => {
    const data = {
      ...validAnnouncement,
      special_marks: 'A'.repeat(500),
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject special_marks longer than 500 characters', () => {
    const data = {
      ...validAnnouncement,
      special_marks: 'A'.repeat(501),
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Znaki szczególne nie mogą przekraczać 500 znaków');
    }
  });

  it('should trim whitespace from special_marks', () => {
    const data = {
      ...validAnnouncement,
      special_marks: '  Collar  ',
    };
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.special_marks).toBe('Collar');
    }
  });

  it('should reject unknown fields (strict mode)', () => {
    const data = {
      ...validAnnouncement,
      unknownField: 'value',
    } as any;
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const data = {};
    const result = createAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.success ? 0 : result.error.issues.length).toBeGreaterThan(0);
  });
});

describe('updateAnnouncementSchema', () => {
  it('should accept empty object (all fields optional)', () => {
    const result = updateAnnouncementSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept partial update with single field', () => {
    const data = {
      title: 'Updated title',
    };
    const result = updateAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Updated title');
    }
  });

  it('should validate title when provided', () => {
    const data = {
      title: 'Ab',
    };
    const result = updateAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Tytuł musi mieć co najmniej 3 znaki');
    }
  });

  it('should accept nullable size field', () => {
    const data = {
      size: null,
    };
    const result = updateAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.size).toBeNull();
    }
  });

  it('should accept nullable color field', () => {
    const data = {
      color: null,
    };
    const result = updateAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.color).toBeNull();
    }
  });

  it('should accept nullable age_range field', () => {
    const data = {
      age_range: null,
    };
    const result = updateAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.age_range).toBeNull();
    }
  });

  it('should accept nullable description field', () => {
    const data = {
      description: null,
    };
    const result = updateAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
    }
  });

  it('should accept nullable special_marks field', () => {
    const data = {
      special_marks: null,
    };
    const result = updateAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.special_marks).toBeNull();
    }
  });

  it('should accept status field', () => {
    const statuses = ['active', 'resolved'] as const;
    for (const status of statuses) {
      const data = { status };
      const result = updateAnnouncementSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid status enum value', () => {
    const data = {
      status: 'invalid' as any,
    };
    const result = updateAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Status musi być 'active' lub 'resolved'");
    }
  });

  it('should reject unknown fields (strict mode)', () => {
    const data = {
      unknownField: 'value',
    } as any;
    const result = updateAnnouncementSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('getAnnouncementsQuerySchema', () => {
  it('should accept empty object with defaults', () => {
    const result = getAnnouncementsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('active');
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.order_by).toBe('created_at');
      expect(result.data.order).toBe('desc');
    }
  });

  it('should transform string page to number', () => {
    const data = {
      page: '5',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(5);
      expect(typeof result.data.page).toBe('number');
    }
  });

  it('should default page to 1 when not provided', () => {
    const result = getAnnouncementsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
    }
  });

  it('should reject page less than 1', () => {
    const data = {
      page: '0',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should transform string limit to number', () => {
    const data = {
      limit: '10',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(10);
      expect(typeof result.data.limit).toBe('number');
    }
  });

  it('should default limit to 20 when not provided', () => {
    const result = getAnnouncementsQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
    }
  });

  it('should reject limit less than 1', () => {
    const data = {
      limit: '0',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject limit greater than 100', () => {
    const data = {
      limit: '101',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept limit equal to 100', () => {
    const data = {
      limit: '100',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(100);
    }
  });

  it('should accept all optional filter fields', () => {
    const data = {
      type: 'lost' as const,
      species: 'dog' as const,
      voivodeship: 'Mazowieckie',
      poviat: 'Warszawa',
      size: 'medium' as const,
      color: 'Brown',
      age_range: 'adult' as const,
      event_date_from: '2024-01-01',
      event_date_to: '2024-01-31',
      status: 'active' as const,
      author_id: '123e4567-e89b-12d3-a456-426614174000',
      order_by: 'event_date' as const,
      order: 'asc' as const,
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should validate event_date_from format', () => {
    const data = {
      event_date_from: '2024/01/01',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should validate event_date_to format', () => {
    const data = {
      event_date_to: '2024/01/31',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject when event_date_from is after event_date_to', () => {
    const data = {
      event_date_from: '2024-01-31',
      event_date_to: '2024-01-01',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data zdarzenia "od" musi być wcześniejsza lub równa dacie "do"');
    }
  });

  it('should accept when event_date_from equals event_date_to', () => {
    const data = {
      event_date_from: '2024-01-15',
      event_date_to: '2024-01-15',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept when event_date_from is before event_date_to', () => {
    const data = {
      event_date_from: '2024-01-01',
      event_date_to: '2024-01-31',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept event_date_from without event_date_to', () => {
    const data = {
      event_date_from: '2024-01-01',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept event_date_to without event_date_from', () => {
    const data = {
      event_date_to: '2024-01-31',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should validate author_id as UUID', () => {
    const data = {
      author_id: 'not-a-uuid',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nieprawidłowy identyfikator użytkownika');
    }
  });

  it('should accept valid UUID for author_id', () => {
    const data = {
      author_id: '123e4567-e89b-12d3-a456-426614174000',
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should validate order_by enum', () => {
    const validOrders = ['created_at', 'event_date'] as const;
    for (const orderBy of validOrders) {
      const data = { order_by: orderBy };
      const result = getAnnouncementsQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid order_by value', () => {
    const data = {
      order_by: 'invalid' as any,
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should validate order enum', () => {
    const validOrders = ['asc', 'desc'] as const;
    for (const order of validOrders) {
      const data = { order };
      const result = getAnnouncementsQuerySchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('should reject invalid order value', () => {
    const data = {
      order: 'invalid' as any,
    };
    const result = getAnnouncementsQuerySchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});




