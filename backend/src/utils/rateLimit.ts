import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const ddb = new DynamoDBClient({ region: process.env.REGION });
const RATE_LIMIT_TABLE =
  process.env.RATE_LIMIT_TABLE || "uniapply-rate-limits-dev";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (event: any) => string; // Custom key generator
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Default rate limit configurations
export const RATE_LIMITS = {
  // Unauthenticated requests - very strict
  UNAUTHENTICATED: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    keyGenerator: (event: any) => `unauth:${getClientIP(event)}`,
  },

  // Authentication endpoints - very strict
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    keyGenerator: (event: any) => `auth:${getClientIP(event)}`,
  },

  // General API endpoints - moderate
  API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    keyGenerator: (event: any) => `api:${getClientIP(event)}`,
  },

  // Search endpoints - stricter
  SEARCH: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 searches per minute
    keyGenerator: (event: any) => `search:${getClientIP(event)}`,
  },

  // File upload endpoints - moderate
  UPLOAD: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 uploads per minute
    keyGenerator: (event: any) => `upload:${getClientIP(event)}`,
  },

  // Admin endpoints - very strict
  ADMIN: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    keyGenerator: (event: any) => `admin:${getClientIP(event)}`,
  },
};

// Helper function to get client IP
export function getClientIP(event: any): string {
  return (
    event.requestContext?.http?.sourceIp ||
    event.headers?.["x-forwarded-for"]?.split(",")[0] ||
    event.headers?.["x-real-ip"] ||
    "unknown"
  );
}

// Helper function to determine if request is authenticated
export function isAuthenticated(event: any): boolean {
  const authHeader =
    event.headers?.authorization || event.headers?.Authorization;
  return authHeader && authHeader.startsWith("Bearer ");
}

// Helper function to get appropriate rate limit config based on request
export function getRateLimitConfig(event: any): RateLimitConfig {
  const path = event.rawPath || event.path || "";
  const method = event.requestContext?.http?.method || event.httpMethod || "";

  // Check if request is authenticated
  if (!isAuthenticated(event)) {
    return RATE_LIMITS.UNAUTHENTICATED;
  }

  // Authentication endpoints
  if (
    path.includes("/auth") ||
    path.includes("/login") ||
    path.includes("/signup")
  ) {
    return RATE_LIMITS.AUTH;
  }

  // Search endpoints
  if (path.includes("/search") || path.includes("?q=")) {
    return RATE_LIMITS.SEARCH;
  }

  // File upload endpoints
  if (path.includes("/files") || path.includes("/upload")) {
    return RATE_LIMITS.UPLOAD;
  }

  // Admin endpoints
  if (
    path.includes("/admin") ||
    path.includes("/audit") ||
    path.includes("/system")
  ) {
    return RATE_LIMITS.ADMIN;
  }

  // Default API rate limit
  return RATE_LIMITS.API;
}

export async function checkRateLimit(
  event: any,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  // Use provided config or determine automatically
  const rateLimitConfig = config || getRateLimitConfig(event);
  const key = rateLimitConfig.keyGenerator
    ? rateLimitConfig.keyGenerator(event)
    : `default:${getClientIP(event)}`;
  const now = Date.now();
  const windowStart = now - rateLimitConfig.windowMs;

  try {
    // Get current rate limit record
    const getResult = await ddb.send(
      new GetItemCommand({
        TableName: RATE_LIMIT_TABLE,
        Key: marshall({ key }),
      })
    );

    let record = getResult.Item ? unmarshall(getResult.Item) : null;

    if (!record || record.windowStart < windowStart) {
      // New window or expired record
      record = {
        key,
        count: 1,
        windowStart: now,
        resetTime: now + rateLimitConfig.windowMs,
      };

      await ddb.send(
        new PutItemCommand({
          TableName: RATE_LIMIT_TABLE,
          Item: marshall(record, { removeUndefinedValues: true }),
        })
      );

      return {
        allowed: true,
        remaining: rateLimitConfig.maxRequests - 1,
        resetTime: record.resetTime,
      };
    }

    // Existing window
    if (record.count >= rateLimitConfig.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      };
    }

    // Increment count
    const updateResult = await ddb.send(
      new UpdateItemCommand({
        TableName: RATE_LIMIT_TABLE,
        Key: marshall({ key }),
        UpdateExpression: "SET #count = #count + :inc",
        ExpressionAttributeNames: {
          "#count": "count",
        },
        ExpressionAttributeValues: {
          ":inc": { N: "1" },
        },
        ReturnValues: "UPDATED_NEW",
      })
    );

    const newCount = parseInt(updateResult.Attributes?.count?.N || "0");

    return {
      allowed: true,
      remaining: rateLimitConfig.maxRequests - newCount,
      resetTime: record.resetTime,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // On error, allow the request but log the issue
    return {
      allowed: true,
      remaining: rateLimitConfig.maxRequests - 1,
      resetTime: now + rateLimitConfig.windowMs,
    };
  }
}

export function createRateLimitHeaders(
  result: RateLimitResult,
  config: RateLimitConfig
) {
  return {
    "x-ratelimit-limit": config.maxRequests.toString(),
    "x-ratelimit-remaining": result.remaining.toString(),
    "x-ratelimit-reset": result.resetTime.toString(),
    ...(result.retryAfter && { "retry-after": result.retryAfter.toString() }),
  };
}

export function createRateLimitMiddleware(config?: RateLimitConfig) {
  return async (event: any) => {
    const rateLimitConfig = config || getRateLimitConfig(event);
    const result = await checkRateLimit(event, rateLimitConfig);

    if (!result.allowed) {
      return {
        statusCode: 429,
        body: JSON.stringify({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: result.retryAfter,
        }),
        headers: {
          "Content-Type": "application/json",
          ...createRateLimitHeaders(result, rateLimitConfig),
        },
      };
    }

    return null; // Continue with request
  };
}
