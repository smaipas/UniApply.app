import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const ddb = new DynamoDBClient({ region: process.env.REGION });
const SECURITY_EVENTS_TABLE =
  process.env.SECURITY_EVENTS_TABLE || "uniapply-security-events-dev";

export enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  AUTHENTICATION_FAILURE = "AUTHENTICATION_FAILURE",
  AUTHORIZATION_FAILURE = "AUTHORIZATION_FAILURE",
  INVALID_INPUT = "INVALID_INPUT",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  FILE_UPLOAD_ATTEMPT = "FILE_UPLOAD_ATTEMPT",
  SQL_INJECTION_ATTEMPT = "SQL_INJECTION_ATTEMPT",
  XSS_ATTEMPT = "XSS_ATTEMPT",
  PATH_TRAVERSAL_ATTEMPT = "PATH_TRAVERSAL_ATTEMPT",
  BRUTE_FORCE_ATTEMPT = "BRUTE_FORCE_ATTEMPT",
  TOKEN_BLACKLISTED = "TOKEN_BLACKLISTED",
  UNUSUAL_ACCESS_PATTERN = "UNUSUAL_ACCESS_PATTERN",
}

export enum SecurityEventSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  timestamp: string;
  sourceIP: string;
  userAgent?: string;
  userId?: string;
  endpoint: string;
  method: string;
  details: Record<string, any>;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private eventQueue: SecurityEvent[] = [];
  private isProcessing = false;

  private constructor() {}

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  /**
   * Log a security event
   */
  async logEvent(
    type: SecurityEventType,
    severity: SecurityEventSeverity,
    event: any,
    details: Record<string, any> = {}
  ): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: this.generateEventId(),
      type,
      severity,
      timestamp: new Date().toISOString(),
      sourceIP: this.getClientIP(event),
      userAgent: event.headers?.["user-agent"] || event.headers?.["User-Agent"],
      userId: this.getUserId(event),
      endpoint: event.requestContext?.http?.path || event.rawPath || "unknown",
      method:
        event.requestContext?.http?.method || event.httpMethod || "unknown",
      details,
      resolved: false,
    };

    // Add to queue for batch processing
    this.eventQueue.push(securityEvent);

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }

    // Log critical events immediately
    if (severity === SecurityEventSeverity.CRITICAL) {
      await this.saveEventImmediately(securityEvent);
    }
  }

  /**
   * Log rate limit exceeded event
   */
  async logRateLimitExceeded(event: any, rateLimitConfig: any): Promise<void> {
    await this.logEvent(
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      SecurityEventSeverity.MEDIUM,
      event,
      {
        rateLimitConfig,
        clientIP: this.getClientIP(event),
        userAgent: event.headers?.["user-agent"],
      }
    );
  }

  /**
   * Log authentication failure
   */
  async logAuthenticationFailure(event: any, reason: string): Promise<void> {
    await this.logEvent(
      SecurityEventType.AUTHENTICATION_FAILURE,
      SecurityEventSeverity.HIGH,
      event,
      {
        reason,
        clientIP: this.getClientIP(event),
        attemptedToken: this.getTokenFromEvent(event),
      }
    );
  }

  /**
   * Log suspicious input
   */
  async logSuspiciousInput(
    event: any,
    inputType: string,
    details: any
  ): Promise<void> {
    const severity = this.determineInputSeverity(inputType, details);

    await this.logEvent(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity,
      event,
      {
        inputType,
        details,
        clientIP: this.getClientIP(event),
      }
    );
  }

  /**
   * Log file upload attempt
   */
  async logFileUploadAttempt(
    event: any,
    fileDetails: any,
    blocked: boolean
  ): Promise<void> {
    const severity = blocked
      ? SecurityEventSeverity.MEDIUM
      : SecurityEventSeverity.LOW;
    const type = blocked
      ? SecurityEventType.FILE_UPLOAD_ATTEMPT
      : SecurityEventType.SUSPICIOUS_ACTIVITY;

    await this.logEvent(type, severity, event, {
      fileDetails,
      blocked,
      clientIP: this.getClientIP(event),
    });
  }

  /**
   * Get recent security events for an IP
   */
  async getRecentEventsForIP(
    sourceIP: string,
    hours: number = 24
  ): Promise<SecurityEvent[]> {
    try {
      const now = new Date();
      const cutoffTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
      const cutoffTimestamp = cutoffTime.toISOString();

      const result = await ddb.send(
        new QueryCommand({
          TableName: SECURITY_EVENTS_TABLE,
          IndexName: "sourceIP-timestamp-index",
          KeyConditionExpression:
            "sourceIP = :sourceIP AND #timestamp >= :cutoffTime",
          ExpressionAttributeNames: {
            "#timestamp": "timestamp",
          },
          ExpressionAttributeValues: marshall({
            ":sourceIP": sourceIP,
            ":cutoffTime": cutoffTimestamp,
          }),
          ScanIndexForward: false, // Most recent first
        })
      );

      if (!result.Items) {
        return [];
      }

      return result.Items.map((item) => unmarshall(item) as SecurityEvent);
    } catch (error) {
      console.error("Error querying security events for IP:", error);
      return [];
    }
  }

  /**
   * Check if IP should be blocked based on recent events
   */
  async shouldBlockIP(sourceIP: string): Promise<boolean> {
    const recentEvents = await this.getRecentEventsForIP(sourceIP, 1); // Last hour

    const criticalCount = recentEvents.filter(
      (e) => e.severity === SecurityEventSeverity.CRITICAL
    ).length;
    const highCount = recentEvents.filter(
      (e) => e.severity === SecurityEventSeverity.HIGH
    ).length;
    const mediumCount = recentEvents.filter(
      (e) => e.severity === SecurityEventSeverity.MEDIUM
    ).length;

    // Block if:
    // - 1+ critical events in last hour
    // - 3+ high severity events in last hour
    // - 10+ medium severity events in last hour
    return criticalCount > 0 || highCount >= 3 || mediumCount >= 10;
  }

  /**
   * Process the event queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const events = [...this.eventQueue];
      this.eventQueue = [];

      // Batch save events
      await this.saveEventsBatch(events);
    } catch (error) {
      console.error("Error processing security events queue:", error);
      // Re-add events to queue for retry
      this.eventQueue.unshift(...this.eventQueue);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Save events in batch
   */
  private async saveEventsBatch(events: SecurityEvent[]): Promise<void> {
    try {
      // Save each event individually (DynamoDB batch write has limitations)
      for (const event of events) {
        await this.saveEvent(event);
      }
    } catch (error) {
      console.error("Error saving security events batch:", error);
      throw error;
    }
  }

  /**
   * Save a single event immediately
   */
  private async saveEventImmediately(event: SecurityEvent): Promise<void> {
    try {
      await this.saveEvent(event);
    } catch (error) {
      console.error("Error saving critical security event:", error);
    }
  }

  /**
   * Save event to DynamoDB
   */
  private async saveEvent(event: SecurityEvent): Promise<void> {
    try {
      // Add TTL (30 days from now)
      const ttl = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

      await ddb.send(
        new PutItemCommand({
          TableName: SECURITY_EVENTS_TABLE,
          Item: marshall({ ...event, ttl }, { removeUndefinedValues: true }),
        })
      );
    } catch (error) {
      console.error("Error saving security event to DynamoDB:", error);
      throw error;
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get client IP from event
   */
  private getClientIP(event: any): string {
    return (
      event.requestContext?.http?.sourceIp ||
      event.headers?.["x-forwarded-for"]?.split(",")[0] ||
      event.headers?.["x-real-ip"] ||
      "unknown"
    );
  }

  /**
   * Get user ID from event
   */
  private getUserId(event: any): string | undefined {
    const claims = (event.requestContext as any)?.authorizer?.jwt?.claims;
    return claims?.sub as string | undefined;
  }

  /**
   * Get token from event
   */
  private getTokenFromEvent(event: any): string | undefined {
    const authHeader =
      event.headers?.authorization || event.headers?.Authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
    return undefined;
  }

  /**
   * Determine severity based on input type and details
   */
  private determineInputSeverity(
    inputType: string,
    details: any
  ): SecurityEventSeverity {
    if (
      inputType === "sql_injection" ||
      inputType === "xss" ||
      inputType === "path_traversal"
    ) {
      return SecurityEventSeverity.HIGH;
    }

    if (inputType === "suspicious_pattern" || inputType === "large_payload") {
      return SecurityEventSeverity.MEDIUM;
    }

    return SecurityEventSeverity.LOW;
  }
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance();
