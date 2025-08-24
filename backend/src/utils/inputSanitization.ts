import sanitizeHtml from "sanitize-html";
import validator from "validator";
import { z } from "zod";

export interface SanitizationOptions {
  allowHtml?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  maxLength?: number;
  trimWhitespace?: boolean;
  removeControlChars?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  sanitized?: string;
  errors?: string[];
}

export class InputSanitizer {
  private static instance: InputSanitizer;

  static getInstance(): InputSanitizer {
    if (!InputSanitizer.instance) {
      InputSanitizer.instance = new InputSanitizer();
    }
    return InputSanitizer.instance;
  }

  /**
   * Sanitize string input with configurable options
   */
  sanitizeString(
    input: unknown,
    options: SanitizationOptions = {}
  ): ValidationResult {
    if (typeof input !== "string") {
      return { valid: false, errors: ["Input must be a string"] };
    }

    let sanitized = input;
    const errors: string[] = [];

    try {
      // Trim whitespace if requested
      if (options.trimWhitespace !== false) {
        sanitized = sanitized.trim();
      }

      // Remove control characters
      if (options.removeControlChars !== false) {
        sanitized = this.removeControlCharacters(sanitized);
      }

      // Check length constraints
      if (options.maxLength && sanitized.length > options.maxLength) {
        return {
          valid: false,
          errors: [
            `Input exceeds maximum length of ${options.maxLength} characters`,
          ],
        };
      }

      // Handle HTML content
      if (options.allowHtml) {
        sanitized = this.sanitizeHtml(sanitized, options);
      } else {
        // Strip all HTML tags and decode entities
        sanitized = this.stripHtml(sanitized);
      }

      // Additional validation checks
      if (this.containsSqlInjectionPatterns(sanitized)) {
        errors.push("Potentially malicious SQL-like patterns detected");
      }

      if (this.containsNoSqlInjectionPatterns(sanitized)) {
        errors.push("Potentially malicious NoSQL injection patterns detected");
      }

      if (this.containsScriptPatterns(sanitized)) {
        errors.push("Script injection patterns detected");
      }

      return {
        valid: errors.length === 0,
        sanitized,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        valid: false,
        errors: ["Input sanitization failed"],
      };
    }
  }

  /**
   * Sanitize HTML content with allowed tags and attributes
   */
  private sanitizeHtml(input: string, options: SanitizationOptions): string {
    const allowedTags = options.allowedTags || [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "ol",
      "ul",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ];

    const allowedAttributes = options.allowedAttributes || {
      "*": ["class"],
    };

    return sanitizeHtml(input, {
      allowedTags: allowedTags,
      allowedAttributes: allowedAttributes,
      allowedSchemes: ["http", "https"],
      disallowedTagsMode: "recursiveEscape",
    });
  }

  /**
   * Strip all HTML tags and decode entities
   */
  private stripHtml(input: string): string {
    // Use sanitize-html to completely strip HTML
    const stripped = sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: "recursiveEscape",
    });

    // Decode HTML entities
    return validator.unescape(stripped);
  }

  /**
   * Remove control characters except tabs, newlines, and carriage returns
   */
  private removeControlCharacters(input: string): string {
    // Remove all control characters except \t, \n, \r
    return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  }

  /**
   * Check for SQL injection patterns
   */
  private containsSqlInjectionPatterns(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(--|\#|\/\*|\*\/)/,
      /('|(\\)|;|\|\||&&)/,
      /(exec\s*\(|execute\s*\()/i,
      /(script\s*:|javascript\s*:)/i,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Check for NoSQL injection patterns (MongoDB, DynamoDB)
   */
  private containsNoSqlInjectionPatterns(input: string): boolean {
    const noSqlPatterns = [
      /\$where/i,
      /\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$all|\$size|\$exists|\$type|\$mod|\$regex|\$options/i,
      /\$or|\$and|\$not|\$nor/i,
      /\$eval|\$function|\$accumulator|\$addFields|\$bucket|\$count|\$group|\$lookup|\$match|\$project|\$sort|\$limit|\$skip/i,
      /new\s+Function\s*\(/i,
      /eval\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
    ];

    return noSqlPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Check for script injection patterns
   */
  private containsScriptPatterns(input: string): boolean {
    const scriptPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /javascript\s*:/i,
      /vbscript\s*:/i,
      /data\s*:\s*text\/html/i,
      /on\w+\s*=/i, // Event handlers like onclick, onload, etc.
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /<link[^>]*>/gi,
      /<meta[^>]*>/gi,
    ];

    return scriptPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Sanitize email input
   */
  sanitizeEmail(input: unknown): ValidationResult {
    if (typeof input !== "string") {
      return { valid: false, errors: ["Email must be a string"] };
    }

    const trimmed = input.trim().toLowerCase();

    if (!validator.isEmail(trimmed)) {
      return { valid: false, errors: ["Invalid email format"] };
    }

    if (trimmed.length > 254) {
      return { valid: false, errors: ["Email exceeds maximum length"] };
    }

    return { valid: true, sanitized: trimmed };
  }

  /**
   * Sanitize URL input
   */
  sanitizeUrl(input: unknown): ValidationResult {
    if (typeof input !== "string") {
      return { valid: false, errors: ["URL must be a string"] };
    }

    const trimmed = input.trim();

    if (
      !validator.isURL(trimmed, {
        protocols: ["http", "https"],
        require_protocol: true,
        require_valid_protocol: true,
        allow_underscores: false,
        allow_trailing_dot: false,
        allow_protocol_relative_urls: false,
      })
    ) {
      return { valid: false, errors: ["Invalid URL format"] };
    }

    return { valid: true, sanitized: trimmed };
  }

  /**
   * Sanitize phone number input
   */
  sanitizePhoneNumber(input: unknown): ValidationResult {
    if (typeof input !== "string") {
      return { valid: false, errors: ["Phone number must be a string"] };
    }

    // Remove all non-digit characters except + and spaces
    let sanitized = input.replace(/[^\d\+\s\-\(\)]/g, "");

    if (!validator.isMobilePhone(sanitized, "any", { strictMode: false })) {
      return { valid: false, errors: ["Invalid phone number format"] };
    }

    return { valid: true, sanitized };
  }

  /**
   * Sanitize filename for file uploads
   */
  sanitizeFilename(input: unknown): ValidationResult {
    if (typeof input !== "string") {
      return { valid: false, errors: ["Filename must be a string"] };
    }

    let sanitized = input.trim();

    // Remove path traversal attempts
    sanitized = sanitized.replace(/\.\./g, "");
    sanitized = sanitized.replace(/[\/\\]/g, "");

    // Remove dangerous characters
    sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, "");

    // Limit length
    if (sanitized.length > 255) {
      sanitized = sanitized.substring(0, 255);
    }

    // Ensure filename is not empty after sanitization
    if (!sanitized || sanitized === ".") {
      return { valid: false, errors: ["Invalid filename"] };
    }

    return { valid: true, sanitized };
  }

  /**
   * Sanitize object recursively
   */
  sanitizeObject(
    obj: Record<string, unknown>,
    fieldOptions: Record<string, SanitizationOptions> = {}
  ): {
    valid: boolean;
    sanitized?: Record<string, unknown>;
    errors?: Record<string, string[]>;
  } {
    const sanitized: Record<string, unknown> = {};
    const errors: Record<string, string[]> = {};

    for (const [key, value] of Object.entries(obj)) {
      const options = fieldOptions[key] || {};

      if (typeof value === "string") {
        const result = this.sanitizeString(value, options);
        if (result.valid) {
          sanitized[key] = result.sanitized;
        } else {
          errors[key] = result.errors || ["Validation failed"];
        }
      } else if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const nestedResult = this.sanitizeObject(
          value as Record<string, unknown>,
          fieldOptions
        );
        if (nestedResult.valid) {
          sanitized[key] = nestedResult.sanitized;
        } else {
          errors[key] = ["Nested object validation failed"];
        }
      } else {
        sanitized[key] = value; // Keep non-string values as-is
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      sanitized: Object.keys(errors).length === 0 ? sanitized : undefined,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
  }
}

// Export singleton instance
export const inputSanitizer = InputSanitizer.getInstance();

// Enhanced Zod schemas with sanitization
export const createSanitizedStringSchema = (
  options: SanitizationOptions = {}
) => {
  return z.string().transform((val, ctx) => {
    const result = inputSanitizer.sanitizeString(val, options);
    if (!result.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.errors?.join(", ") || "Validation failed",
      });
      return z.NEVER;
    }
    return result.sanitized!;
  });
};

export const sanitizedEmailSchema = z.string().transform((val, ctx) => {
  const result = inputSanitizer.sanitizeEmail(val);
  if (!result.valid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: result.errors?.join(", ") || "Invalid email",
    });
    return z.NEVER;
  }
  return result.sanitized!;
});

export const sanitizedUrlSchema = z.string().transform((val, ctx) => {
  const result = inputSanitizer.sanitizeUrl(val);
  if (!result.valid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: result.errors?.join(", ") || "Invalid URL",
    });
    return z.NEVER;
  }
  return result.sanitized!;
});
