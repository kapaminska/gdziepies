import { describe, it, expect, vi } from 'vitest';
import {
  ApiError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  handleApiError,
} from '../errors';

describe('ApiError', () => {
  it('should create ApiError with all properties', () => {
    const error = new ApiError(400, 'TEST_ERROR', 'Test message', { detail: 'test' });
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.message).toBe('Test message');
    expect(error.details).toEqual({ detail: 'test' });
    expect(error.name).toBe('ApiError');
  });

  it('should create ApiError without details', () => {
    const error = new ApiError(500, 'INTERNAL_ERROR', 'Internal error');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.message).toBe('Internal error');
    expect(error.details).toBeUndefined();
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new ApiError(400, 'TEST', 'Test');
    }).toThrow(ApiError);
  });

  it('should preserve error message when caught', () => {
    try {
      throw new ApiError(400, 'TEST', 'Test message');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      if (error instanceof ApiError) {
        expect(error.message).toBe('Test message');
      }
    }
  });
});

describe('ValidationError', () => {
  it('should create ValidationError with field errors', () => {
    const fieldErrors = [
      { field: 'title', message: 'Title is required' },
      { field: 'email', message: 'Invalid email format' },
    ];
    const error = new ValidationError('Validation failed', fieldErrors);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Validation failed');
    expect(error.fieldErrors).toEqual(fieldErrors);
    expect(error.details).toEqual(fieldErrors);
    expect(error.name).toBe('ValidationError');
  });

  it('should create ValidationError with empty field errors array', () => {
    const error = new ValidationError('Validation failed', []);
    expect(error.fieldErrors).toEqual([]);
    expect(error.statusCode).toBe(400);
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new ValidationError('Test', []);
    }).toThrow(ValidationError);
  });
});

describe('NotFoundError', () => {
  it('should create NotFoundError with resource and ID', () => {
    const error = new NotFoundError('Ogłoszenie', '123e4567-e89b-12d3-a456-426614174000');
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Ogłoszenie o podanym ID nie zostało znalezione');
    expect(error.name).toBe('NotFoundError');
  });

  it('should create NotFoundError without ID', () => {
    const error = new NotFoundError('Ogłoszenie');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Ogłoszenie nie zostało znalezione');
  });

  it('should format message correctly for different resources', () => {
    const error1 = new NotFoundError('Komentarz', 'uuid-123');
    expect(error1.message).toBe('Komentarz o podanym ID nie zostało znalezione');

    const error2 = new NotFoundError('Profil');
    expect(error2.message).toBe('Profil nie zostało znalezione');
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new NotFoundError('Resource');
    }).toThrow(NotFoundError);
  });
});

describe('UnauthorizedError', () => {
  it('should create UnauthorizedError with default message', () => {
    const error = new UnauthorizedError();
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(UnauthorizedError);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.message).toBe('Wymagane uwierzytelnienie');
    expect(error.name).toBe('UnauthorizedError');
  });

  it('should create UnauthorizedError with custom message', () => {
    const error = new UnauthorizedError('Custom unauthorized message');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.message).toBe('Custom unauthorized message');
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new UnauthorizedError();
    }).toThrow(UnauthorizedError);
  });
});

describe('ForbiddenError', () => {
  it('should create ForbiddenError with default message', () => {
    const error = new ForbiddenError();
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
    expect(error.message).toBe('Brak uprawnień do wykonania tej operacji');
    expect(error.name).toBe('ForbiddenError');
  });

  it('should create ForbiddenError with custom message', () => {
    const error = new ForbiddenError('Custom forbidden message');
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
    expect(error.message).toBe('Custom forbidden message');
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new ForbiddenError();
    }).toThrow(ForbiddenError);
  });
});

describe('ConflictError', () => {
  it('should create ConflictError with message and details', () => {
    const details = { duplicateField: 'email' };
    const error = new ConflictError('Conflict occurred', details);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(ConflictError);
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
    expect(error.message).toBe('Conflict occurred');
    expect(error.details).toEqual(details);
    expect(error.name).toBe('ConflictError');
  });

  it('should create ConflictError without details', () => {
    const error = new ConflictError('Conflict occurred');
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
    expect(error.message).toBe('Conflict occurred');
    expect(error.details).toBeUndefined();
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new ConflictError('Test');
    }).toThrow(ConflictError);
  });
});

describe('handleApiError', () => {
  it('should handle ApiError and return Response with correct status', () => {
    const error = new ApiError(400, 'TEST_ERROR', 'Test message', { detail: 'test' });
    const response = handleApiError(error);
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(400);
  });

  it('should return JSON response with error structure for ApiError', async () => {
    const error = new ApiError(404, 'NOT_FOUND', 'Resource not found', { id: '123' });
    const response = handleApiError(error);
    const data = await response.json();
    expect(data).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
        details: { id: '123' },
      },
    });
  });

  it('should set Content-Type header to application/json', () => {
    const error = new ApiError(400, 'TEST', 'Test');
    const response = handleApiError(error);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('should handle ValidationError correctly', async () => {
    const fieldErrors = [
      { field: 'title', message: 'Title is required' },
    ];
    const error = new ValidationError('Validation failed', fieldErrors);
    const response = handleApiError(error);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
    expect(data.error.details).toEqual(fieldErrors);
  });

  it('should handle NotFoundError correctly', async () => {
    const error = new NotFoundError('Ogłoszenie', 'uuid-123');
    const response = handleApiError(error);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error.code).toBe('NOT_FOUND');
    expect(data.error.message).toBe('Ogłoszenie o podanym ID nie zostało znalezione');
  });

  it('should handle UnauthorizedError correctly', async () => {
    const error = new UnauthorizedError();
    const response = handleApiError(error);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe('UNAUTHORIZED');
  });

  it('should handle ForbiddenError correctly', async () => {
    const error = new ForbiddenError();
    const response = handleApiError(error);
    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error.code).toBe('FORBIDDEN');
  });

  it('should handle ConflictError correctly', async () => {
    const error = new ConflictError('Duplicate entry', { field: 'email' });
    const response = handleApiError(error);
    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error.code).toBe('CONFLICT');
    expect(data.error.details).toEqual({ field: 'email' });
  });

  it('should handle unexpected errors (non-ApiError)', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Unexpected error');
    const response = handleApiError(error);
    expect(response.status).toBe(500);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error:', error);
    consoleErrorSpy.mockRestore();
  });

  it('should return INTERNAL_ERROR for unexpected errors', async () => {
    const error = new Error('Unexpected error');
    const response = handleApiError(error);
    const data = await response.json();
    expect(data.error.code).toBe('INTERNAL_ERROR');
    expect(data.error.message).toBe('Wystąpił błąd serwera');
  });

  it('should handle string errors', () => {
    const error = 'String error';
    const response = handleApiError(error);
    expect(response.status).toBe(500);
  });

  it('should handle null errors', () => {
    const error = null;
    const response = handleApiError(error);
    expect(response.status).toBe(500);
  });

  it('should handle undefined errors', () => {
    const error = undefined;
    const response = handleApiError(error);
    expect(response.status).toBe(500);
  });

  it('should handle errors without details', async () => {
    const error = new ApiError(400, 'TEST', 'Test message');
    const response = handleApiError(error);
    const data = await response.json();
    expect(data.error).toEqual({
      code: 'TEST',
      message: 'Test message',
      details: undefined,
    });
  });

  it('should handle errors with complex details', async () => {
    const details = {
      nested: {
        field: 'value',
        array: [1, 2, 3],
      },
    };
    const error = new ApiError(400, 'TEST', 'Test', details);
    const response = handleApiError(error);
    const data = await response.json();
    expect(data.error.details).toEqual(details);
  });
});



