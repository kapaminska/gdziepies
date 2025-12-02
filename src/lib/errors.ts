/**
 * Base class for all API errors.
 * Provides consistent error structure across the application.
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Error thrown when validation fails.
 * Contains field-level error details.
 */
export class ValidationError extends ApiError {
  constructor(message: string, public fieldErrors: Array<{ field: string; message: string }>) {
    super(400, 'VALIDATION_ERROR', message, fieldErrors);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when a resource is not found.
 */
export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} o podanym ID nie zostało znalezione`
      : `${resource} nie zostało znalezione`;
    super(404, 'NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when authentication is required but missing or invalid.
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Wymagane uwierzytelnienie') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error thrown when user lacks permission to perform an action.
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Brak uprawnień do wykonania tej operacji') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Error thrown when there's a conflict (e.g., duplicate entry).
 */
export class ConflictError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(409, 'CONFLICT', message, details);
    this.name = 'ConflictError';
  }
}

/**
 * Helper function to handle API errors and return appropriate HTTP responses.
 * Should be used in API route handlers.
 */
export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return new Response(
      JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      }),
      {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Unexpected errors
  console.error('Unexpected error:', error);
  return new Response(
    JSON.stringify({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Wystąpił błąd serwera',
      },
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}


