import { z } from "zod";

// File validation constants
export const FILE_VALIDATION = {
  // Maximum file size (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  // Allowed MIME types
  ALLOWED_MIME_TYPES: [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",

    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    // Text files
    "text/plain",
    "text/csv",

    // Archives
    "application/zip",
    "application/x-rar-compressed",
  ] as const,

  // Allowed file extensions
  ALLOWED_EXTENSIONS: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "txt",
    "csv",
    "zip",
    "rar",
  ] as const,

  // Dangerous file types to block
  DANGEROUS_EXTENSIONS: [
    "exe",
    "bat",
    "cmd",
    "com",
    "pif",
    "scr",
    "vbs",
    "js",
    "jar",
    "php",
    "asp",
    "aspx",
    "jsp",
    "py",
    "pl",
    "rb",
    "sh",
    "ps1",
  ] as const,

  // Maximum filename length
  MAX_FILENAME_LENGTH: 255,

  // Maximum path depth
  MAX_PATH_DEPTH: 5,
} as const;

// File validation schema
export const FileValidationSchema = z.object({
  contentType: z.string().min(1),
  fileName: z.string().min(1).max(FILE_VALIDATION.MAX_FILENAME_LENGTH),
  fileSize: z.number().min(1).max(FILE_VALIDATION.MAX_FILE_SIZE),
});

export type FileValidationInput = z.infer<typeof FileValidationSchema>;

// File validation result
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedFileName?: string;
  allowedMimeType?: string;
}

/**
 * Comprehensive file validation utility
 */
export class FileValidator {
  /**
   * Validate file upload request
   */
  static validateFile(input: FileValidationInput): FileValidationResult {
    const errors: string[] = [];

    // Validate file size
    if (input.fileSize > FILE_VALIDATION.MAX_FILE_SIZE) {
      errors.push(
        `File size exceeds maximum limit of ${FILE_VALIDATION.MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
    }

    // Validate MIME type
    const allowedMimeType = this.validateMimeType(input.contentType);
    if (!allowedMimeType) {
      errors.push(`File type '${input.contentType}' is not allowed`);
    }

    // Validate filename
    const filenameValidation = this.validateFilename(input.fileName);
    if (!filenameValidation.valid) {
      errors.push(...filenameValidation.errors);
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitizedFileName: filenameValidation.sanitizedFileName,
      allowedMimeType,
    };
  }

  /**
   * Validate MIME type against allowed types
   */
  static validateMimeType(contentType: string): string | undefined {
    const normalizedType = contentType.toLowerCase().trim();

    // Check against allowed MIME types
    for (const allowedType of FILE_VALIDATION.ALLOWED_MIME_TYPES) {
      if (normalizedType === allowedType) {
        return allowedType;
      }
    }

    return undefined;
  }

  /**
   * Validate and sanitize filename
   */
  static validateFilename(filename: string): {
    valid: boolean;
    errors: string[];
    sanitizedFileName?: string;
  } {
    const errors: string[] = [];

    // Check for path traversal attempts
    if (
      filename.includes("..") ||
      filename.includes("\\") ||
      filename.includes("/")
    ) {
      errors.push("Filename contains path traversal characters");
      return { valid: false, errors };
    }

    // Check for dangerous extensions
    const extension = this.getFileExtension(filename);
    if (
      extension &&
      FILE_VALIDATION.DANGEROUS_EXTENSIONS.includes(extension as any)
    ) {
      errors.push(
        `File extension '${extension}' is not allowed for security reasons`
      );
      return { valid: false, errors };
    }

    // Check filename length
    if (filename.length > FILE_VALIDATION.MAX_FILENAME_LENGTH) {
      errors.push(
        `Filename exceeds maximum length of ${FILE_VALIDATION.MAX_FILENAME_LENGTH} characters`
      );
    }

    // Check for null bytes or control characters
    if (filename.includes("\0") || /[\x00-\x1f\x7f]/.test(filename)) {
      errors.push("Filename contains invalid characters");
      return { valid: false, errors };
    }

    // Sanitize filename
    const sanitized = this.sanitizeFilename(filename);

    return {
      valid: errors.length === 0,
      errors,
      sanitizedFileName: sanitized,
    };
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(filename: string): string | undefined {
    const match = filename.toLowerCase().match(/\.([a-z0-9]+)(?:\?|#|$)/);
    return match ? match[1] : undefined;
  }

  /**
   * Sanitize filename for safe storage
   */
  static sanitizeFilename(filename: string): string {
    // Remove path traversal characters
    let sanitized = filename.replace(/[\\\/]/g, "");

    // Remove null bytes and control characters
    sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, "");

    // Replace spaces with underscores
    sanitized = sanitized.replace(/\s+/g, "_");

    // Remove special characters except dots, hyphens, and underscores
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "");

    // Ensure it doesn't start with a dot
    sanitized = sanitized.replace(/^\.+/, "");

    // Limit length
    if (sanitized.length > FILE_VALIDATION.MAX_FILENAME_LENGTH) {
      const extension = this.getFileExtension(sanitized);
      const nameWithoutExt = extension
        ? sanitized.slice(0, -(extension.length + 1))
        : sanitized;
      const maxNameLength =
        FILE_VALIDATION.MAX_FILENAME_LENGTH -
        (extension ? extension.length + 1 : 0);
      sanitized =
        nameWithoutExt.slice(0, maxNameLength) +
        (extension ? `.${extension}` : "");
    }

    return sanitized || "file";
  }

  /**
   * Generate secure filename with UUID
   */
  static generateSecureFilename(
    originalName: string,
    contentType: string
  ): string {
    const extension =
      this.getFileExtension(originalName) ||
      this.getExtensionFromMimeType(contentType);
    const uuid = crypto.randomUUID();
    return `uploads/${uuid}.${extension}`;
  }

  /**
   * Get file extension from MIME type
   */
  static getExtensionFromMimeType(mimeType: string): string {
    const type = mimeType.toLowerCase();

    if (type.includes("jpeg") || type.includes("jpg")) return "jpg";
    if (type.includes("png")) return "png";
    if (type.includes("gif")) return "gif";
    if (type.includes("webp")) return "webp";
    if (type.includes("pdf")) return "pdf";
    if (type.includes("word") || type.includes("doc")) return "docx";
    if (type.includes("excel") || type.includes("sheet")) return "xlsx";
    if (type.includes("text/plain")) return "txt";
    if (type.includes("csv")) return "csv";
    if (type.includes("zip")) return "zip";
    if (type.includes("rar")) return "rar";

    return "bin";
  }

  /**
   * Check if file is an image
   */
  static isImage(mimeType: string): boolean {
    return mimeType.startsWith("image/");
  }

  /**
   * Check if file is a document
   */
  static isDocument(mimeType: string): boolean {
    return (
      mimeType.includes("pdf") ||
      mimeType.includes("word") ||
      mimeType.includes("excel") ||
      mimeType.includes("text/")
    );
  }

  /**
   * Get human-readable file type description
   */
  static getFileTypeDescription(mimeType: string): string {
    if (this.isImage(mimeType)) return "Image";
    if (this.isDocument(mimeType)) return "Document";
    if (mimeType.includes("zip") || mimeType.includes("rar")) return "Archive";
    return "File";
  }
}
