import { APIGatewayProxyEventV2 } from "aws-lambda";

// Error types for different scenarios
export enum ErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  FILE_UPLOAD_ERROR = "FILE_UPLOAD_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

// Error severity levels
export enum ErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

// Structured error information
export interface ErrorInfo {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code?: string;
  details?: Record<string, any>;
  requestId?: string;
  timestamp: string;
  path?: string;
  method?: string;
  userId?: string;
}

// Error response structure
export interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  requestId?: string;
  timestamp: string;
}

/**
 * Comprehensive error handling utility
 */
export class ErrorHandler {
  private static readonly PRODUCTION_MODE =
    process.env.NODE_ENV === "production";

  /**
   * Create a structured error
   */
  static createError(
    type: ErrorType,
    severity: ErrorSeverity,
    message: string,
    userMessage: string,
    details?: Record<string, any>,
    code?: string
  ): ErrorInfo {
    return {
      type,
      severity,
      message,
      userMessage,
      code,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Handle and log errors appropriately
   */
  static handleError(
    error: unknown,
    event?: APIGatewayProxyEventV2,
    context?: any
  ): ErrorResponse {
    const requestId = context?.awsRequestId || "unknown";
    const path = event?.rawPath || "unknown";
    const method = event?.requestContext?.http?.method || "unknown";
    const userId = this.extractUserId(event);

    let errorInfo: ErrorInfo;

    // Determine error type and create appropriate response
    if (error instanceof Error) {
      errorInfo = this.classifyError(error, requestId, path, method, userId);
    } else {
      errorInfo = this.createError(
        ErrorType.INTERNAL_ERROR,
        ErrorSeverity.HIGH,
        "Unknown error occurred",
        "An unexpected error occurred. Please try again later.",
        { originalError: String(error) },
        "UNKNOWN_ERROR"
      );
    }

    // Log error with appropriate detail level
    this.logError(errorInfo, error);

    // Return sanitized response
    return this.createErrorResponse(errorInfo);
  }

  /**
   * Classify errors based on their characteristics
   */
  private static classifyError(
    error: Error,
    requestId: string,
    path: string,
    method: string,
    userId?: string
  ): ErrorInfo {
    const errorMessage = error.message.toLowerCase();
    const stack = error.stack || "";

    // Check for validation errors
    if (
      errorMessage.includes("validation") ||
      errorMessage.includes("invalid")
    ) {
      return this.createError(
        ErrorType.VALIDATION_ERROR,
        ErrorSeverity.LOW,
        error.message,
        "The provided data is invalid. Please check your input and try again.",
        { path, method },
        "VALIDATION_ERROR"
      );
    }

    // Check for authentication errors
    if (
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("token")
    ) {
      return this.createError(
        ErrorType.AUTHENTICATION_ERROR,
        ErrorSeverity.MEDIUM,
        error.message,
        "Authentication required. Please log in and try again.",
        { path, method },
        "AUTHENTICATION_ERROR"
      );
    }

    // Check for authorization errors
    if (
      errorMessage.includes("forbidden") ||
      errorMessage.includes("permission")
    ) {
      return this.createError(
        ErrorType.AUTHORIZATION_ERROR,
        ErrorSeverity.MEDIUM,
        error.message,
        "You don't have permission to perform this action.",
        { path, method, userId },
        "AUTHORIZATION_ERROR"
      );
    }

    // Check for not found errors
    if (errorMessage.includes("not found") || errorMessage.includes("404")) {
      return this.createError(
        ErrorType.NOT_FOUND_ERROR,
        ErrorSeverity.LOW,
        error.message,
        "The requested resource was not found.",
        { path, method },
        "NOT_FOUND_ERROR"
      );
    }

    // Check for rate limit errors
    if (
      errorMessage.includes("rate limit") ||
      errorMessage.includes("too many requests")
    ) {
      return this.createError(
        ErrorType.RATE_LIMIT_ERROR,
        ErrorSeverity.MEDIUM,
        error.message,
        "Too many requests. Please wait a moment and try again.",
        { path, method, userId },
        "RATE_LIMIT_ERROR"
      );
    }

    // Check for file upload errors
    if (errorMessage.includes("file") || errorMessage.includes("upload")) {
      return this.createError(
        ErrorType.FILE_UPLOAD_ERROR,
        ErrorSeverity.MEDIUM,
        error.message,
        "File upload failed. Please check the file format and size.",
        { path, method },
        "FILE_UPLOAD_ERROR"
      );
    }

    // Check for database errors
    if (
      stack.includes("dynamodb") ||
      stack.includes("database") ||
      errorMessage.includes("db")
    ) {
      return this.createError(
        ErrorType.DATABASE_ERROR,
        ErrorSeverity.HIGH,
        error.message,
        "A database error occurred. Please try again later.",
        { path, method },
        "DATABASE_ERROR"
      );
    }

    // Check for external service errors
    if (
      stack.includes("aws") ||
      stack.includes("s3") ||
      stack.includes("ses")
    ) {
      return this.createError(
        ErrorType.EXTERNAL_SERVICE_ERROR,
        ErrorSeverity.HIGH,
        error.message,
        "A service error occurred. Please try again later.",
        { path, method },
        "EXTERNAL_SERVICE_ERROR"
      );
    }

    // Default to internal error
    return this.createError(
      ErrorType.INTERNAL_ERROR,
      ErrorSeverity.HIGH,
      error.message,
      "An internal error occurred. Please try again later.",
      { path, method },
      "INTERNAL_ERROR"
    );
  }

  /**
   * Log errors with appropriate detail level
   */
  private static logError(errorInfo: ErrorInfo, originalError: unknown): void {
    const logData = {
      ...errorInfo,
      // Include stack trace only in development or for high severity errors
      stack: this.shouldIncludeStack(errorInfo)
        ? (originalError as Error)?.stack
        : undefined,
    };

    // Use appropriate log level based on severity
    switch (errorInfo.severity) {
      case ErrorSeverity.CRITICAL:
        console.error("CRITICAL ERROR:", JSON.stringify(logData, null, 2));
        break;
      case ErrorSeverity.HIGH:
        console.error("HIGH SEVERITY ERROR:", JSON.stringify(logData, null, 2));
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(
          "MEDIUM SEVERITY ERROR:",
          JSON.stringify(logData, null, 2)
        );
        break;
      case ErrorSeverity.LOW:
        console.info("LOW SEVERITY ERROR:", JSON.stringify(logData, null, 2));
        break;
    }
  }

  /**
   * Determine if stack trace should be included in logs
   */
  private static shouldIncludeStack(errorInfo: ErrorInfo): boolean {
    if (!this.PRODUCTION_MODE) return true;
    return (
      errorInfo.severity === ErrorSeverity.HIGH ||
      errorInfo.severity === ErrorSeverity.CRITICAL
    );
  }

  /**
   * Create sanitized error response for client
   */
  private static createErrorResponse(errorInfo: ErrorInfo): ErrorResponse {
    return {
      error: errorInfo.type,
      message: errorInfo.userMessage,
      code: errorInfo.code,
      requestId: errorInfo.requestId,
      timestamp: errorInfo.timestamp,
    };
  }

  /**
   * Extract user ID from event
   */
  private static extractUserId(
    event?: APIGatewayProxyEventV2
  ): string | undefined {
    if (!event?.requestContext?.authorizer?.jwt?.claims?.sub) {
      return undefined;
    }
    return event.requestContext.authorizer.jwt.claims.sub;
  }

  /**
   * Sanitize error details for logging
   */
  static sanitizeErrorDetails(
    details: Record<string, any>
  ): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(details)) {
      // Remove sensitive information
      if (this.isSensitiveField(key)) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "string" && value.length > 1000) {
        // Truncate long strings
        sanitized[key] = value.substring(0, 1000) + "...";
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Check if a field contains sensitive information
   */
  private static isSensitiveField(fieldName: string): boolean {
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /key/i,
      /credential/i,
      /authorization/i,
      /cookie/i,
      /session/i,
    ];

    return sensitivePatterns.some((pattern) => pattern.test(fieldName));
  }

  /**
   * Create a standardized error response for API Gateway
   */
  static createApiGatewayErrorResponse(
    statusCode: number,
    errorInfo: ErrorInfo
  ): {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  } {
    const response = this.createErrorResponse(errorInfo);

    return {
      statusCode,
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": errorInfo.requestId || "unknown",
        // Security headers
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
      },
      body: JSON.stringify(response),
    };
  }
}

// Convenience functions for common error types
export const createValidationError = (
  message: string,
  details?: Record<string, any>
) =>
  ErrorHandler.createError(
    ErrorType.VALIDATION_ERROR,
    ErrorSeverity.LOW,
    message,
    "The provided data is invalid. Please check your input and try again.",
    details,
    "VALIDATION_ERROR"
  );

export const createAuthenticationError = (
  message: string,
  details?: Record<string, any>
) =>
  ErrorHandler.createError(
    ErrorType.AUTHENTICATION_ERROR,
    ErrorSeverity.MEDIUM,
    message,
    "Authentication required. Please log in and try again.",
    details,
    "AUTHENTICATION_ERROR"
  );

export const createAuthorizationError = (
  message: string,
  details?: Record<string, any>
) =>
  ErrorHandler.createError(
    ErrorType.AUTHORIZATION_ERROR,
    ErrorSeverity.MEDIUM,
    message,
    "You don't have permission to perform this action.",
    details,
    "AUTHORIZATION_ERROR"
  );

export const createNotFoundError = (
  message: string,
  details?: Record<string, any>
) =>
  ErrorHandler.createError(
    ErrorType.NOT_FOUND_ERROR,
    ErrorSeverity.LOW,
    message,
    "The requested resource was not found.",
    details,
    "NOT_FOUND_ERROR"
  );

export const createInternalError = (
  message: string,
  details?: Record<string, any>
) =>
  ErrorHandler.createError(
    ErrorType.INTERNAL_ERROR,
    ErrorSeverity.HIGH,
    message,
    "An internal error occurred. Please try again later.",
    details,
    "INTERNAL_ERROR"
  );
