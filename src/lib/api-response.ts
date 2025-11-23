/**
 * Helper functions for creating consistent API responses.
 */

/**
 * Creates a successful response with data.
 */
export function successResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Creates a successful response with data and pagination metadata.
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
): Response {
  return new Response(
    JSON.stringify({
      data,
      pagination,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Creates a 201 Created response with data.
 */
export function createdResponse<T>(data: T): Response {
  return successResponse(data, 201);
}

/**
 * Creates a 204 No Content response.
 */
export function noContentResponse(): Response {
  return new Response(null, {
    status: 204,
  });
}

