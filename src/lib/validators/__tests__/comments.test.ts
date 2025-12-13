import { describe, it, expect } from 'vitest';
import { getCommentsQuerySchema, addCommentSchema } from '../comments';

describe('getCommentsQuerySchema', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';

  it('should accept valid announcement_id', () => {
    const data = {
      announcement_id: validUuid,
    };
    const result = getCommentsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.announcement_id).toBe(validUuid);
      expect(result.data.order).toBe('asc');
    }
  });

  it('should reject invalid UUID format', () => {
    const data = {
      announcement_id: 'not-a-uuid',
    };
    const result = getCommentsQuerySchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nieprawidłowy format UUID');
    }
  });

  it('should reject empty announcement_id', () => {
    const data = {
      announcement_id: '',
    };
    const result = getCommentsQuerySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should default order to "asc" when not provided', () => {
    const data = {
      announcement_id: validUuid,
    };
    const result = getCommentsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.order).toBe('asc');
    }
  });

  it('should accept order "asc"', () => {
    const data = {
      announcement_id: validUuid,
      order: 'asc' as const,
    };
    const result = getCommentsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.order).toBe('asc');
    }
  });

  it('should accept order "desc"', () => {
    const data = {
      announcement_id: validUuid,
      order: 'desc' as const,
    };
    const result = getCommentsQuerySchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.order).toBe('desc');
    }
  });

  it('should reject invalid order value', () => {
    const data = {
      announcement_id: validUuid,
      order: 'invalid' as any,
    };
    const result = getCommentsQuerySchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject missing announcement_id', () => {
    const data = {};
    const result = getCommentsQuerySchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('addCommentSchema', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';

  it('should accept valid comment data', () => {
    const data = {
      announcement_id: validUuid,
      content: 'This is a comment',
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.announcement_id).toBe(validUuid);
      expect(result.data.content).toBe('This is a comment');
      expect(result.data.is_sighting).toBe(false);
    }
  });

  it('should set default value for is_sighting to false', () => {
    const data = {
      announcement_id: validUuid,
      content: 'Comment',
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_sighting).toBe(false);
    }
  });

  it('should accept explicit is_sighting true', () => {
    const data = {
      announcement_id: validUuid,
      content: 'I saw this dog',
      is_sighting: true,
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_sighting).toBe(true);
    }
  });

  it('should accept explicit is_sighting false', () => {
    const data = {
      announcement_id: validUuid,
      content: 'Comment',
      is_sighting: false,
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_sighting).toBe(false);
    }
  });

  it('should reject empty content', () => {
    const data = {
      announcement_id: validUuid,
      content: '',
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Treść komentarza nie może być pusta');
    }
  });

  it('should reject content with only whitespace', () => {
    const data = {
      announcement_id: validUuid,
      content: '   ',
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should trim whitespace from content', () => {
    const data = {
      announcement_id: validUuid,
      content: '  Comment content  ',
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('Comment content');
    }
  });

  it('should accept content with exactly 5000 characters', () => {
    const data = {
      announcement_id: validUuid,
      content: 'A'.repeat(5000),
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject content longer than 5000 characters', () => {
    const data = {
      announcement_id: validUuid,
      content: 'A'.repeat(5001),
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Treść komentarza nie może przekraczać 5000 znaków');
    }
  });

  it('should accept content with 1 character', () => {
    const data = {
      announcement_id: validUuid,
      content: 'A',
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject invalid announcement_id UUID', () => {
    const data = {
      announcement_id: 'not-a-uuid',
      content: 'Comment',
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nieprawidłowy format UUID');
    }
  });

  it('should reject missing announcement_id', () => {
    const data = {
      content: 'Comment',
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject missing content', () => {
    const data = {
      announcement_id: validUuid,
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should accept content with newlines', () => {
    const data = {
      announcement_id: validUuid,
      content: 'Line 1\nLine 2\nLine 3',
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept content with special characters', () => {
    const data = {
      announcement_id: validUuid,
      content: 'Comment with special chars: !@#$%^&*()',
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should accept content with unicode characters', () => {
    const data = {
      announcement_id: validUuid,
      content: 'Komentarz z polskimi znakami: ąęćłńóśźż',
    };
    const result = addCommentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});




