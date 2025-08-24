import { ZodError, ZodSchema, infer as zInfer } from "zod";

export function jsonParse<T = unknown>(body: string | null | undefined): T {
  if (!body) return {} as T;
  try {
    return JSON.parse(body) as T;
  } catch (error) {
    // Ensure consistent 400 response for invalid JSON
    const badRequestError = badRequest("Invalid JSON body");
    badRequestError.details = { originalError: error instanceof Error ? error.message : String(error) };
    throw badRequestError;
  }
}

export function validate<S extends ZodSchema>(
  schema: S,
  data: unknown
): zInfer<S> {
  try {
    return schema.parse(data);
  } catch (e) {
    if (e instanceof ZodError) {
      const details = e.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
        code: i.code,
      }));
      throw badRequest("Validation failed", details);
    }
    throw e;
  }
}

export function badRequest(message = "Bad Request", details?: unknown) {
  const err = new Error(message) as Error & {
    statusCode?: number;
    details?: unknown;
  };
  err.statusCode = 400;
  if (details) err.details = details;
  return err;
}

export function notFound(message = "Not Found", details?: unknown) {
  const err = new Error(message) as Error & {
    statusCode?: number;
    details?: unknown;
  };
  err.statusCode = 404;
  if (details) err.details = details;
  return err;
}

export function unauthorized(message = "Unauthorized", details?: unknown) {
  const err = new Error(message) as Error & {
    statusCode?: number;
    details?: unknown;
  };
  err.statusCode = 401;
  if (details) err.details = details;
  return err;
}

export function forbidden(message = "Forbidden", details?: unknown) {
  const err = new Error(message) as Error & {
    statusCode?: number;
    details?: unknown;
  };
  err.statusCode = 403;
  if (details) err.details = details;
  return err;
}

export function response(
  statusCode: number,
  payload: unknown,
  event?: any,
  rateLimitHeaders?: any
) {
  // Get allowed origins from environment
  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    process.env.PRODUCTION_URL || "https://uniapply.app",
    process.env.STAGING_URL || "https://staging.uniapply.app",
  ];

  // Determine the appropriate origin for CORS
  let corsOrigin = allowedOrigins[0]; // Default to first allowed origin
  if (event?.headers?.origin) {
    const requestOrigin = event.headers.origin;
    if (allowedOrigins.includes(requestOrigin)) {
      corsOrigin = requestOrigin;
    }
  }

  // For backward compatibility, if no event is provided, use the first allowed origin
  // This ensures existing code continues to work while new code can pass the event
  const finalCorsOrigin = event ? corsOrigin : allowedOrigins[0];

  // Determine if this is a GET request for caching
  const isGetRequest = event?.requestContext?.http?.method === "GET";
  const isSuccessfulResponse = statusCode >= 200 && statusCode < 300;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": finalCorsOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, X-Requested-With, X-API-Key",
    // Security headers
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
    "X-Permitted-Cross-Domain-Policies": "none",
  };

  // Set cache headers based on request type and response status
  if (isGetRequest && isSuccessfulResponse) {
    // Allow caching for successful GET requests
    headers["Cache-Control"] = "public, max-age=300, s-maxage=300"; // 5 minutes
    headers["Vary"] = "Authorization"; // Vary by authorization header
  } else {
    // No caching for non-GET requests or error responses
    headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private";
    headers["Pragma"] = "no-cache";
    headers["Expires"] = "0";
  }

  // Add rate limit headers if provided
  if (rateLimitHeaders) {
    Object.assign(headers, rateLimitHeaders);
  }

  // Also check for rate limiting headers stored in event context
  if (event && (event as any)._rateLimitHeaders) {
    const rateLimitHeaders = (event as any)._rateLimitHeaders;
    Object.assign(headers, rateLimitHeaders);
  }

  return {
    statusCode,
    body: JSON.stringify(payload),
    headers,
  };
}
