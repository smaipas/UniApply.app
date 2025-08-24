import { jwtDecode } from "jwt-decode";
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const ddb = new DynamoDBClient({ region: process.env.REGION });
const TOKEN_BLACKLIST_TABLE =
  process.env.TOKEN_BLACKLIST_TABLE || "uniapply-token-blacklist-dev";

interface JwtClaims {
  sub: string;
  email?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  aud?: string;
  jti?: string;
  "cognito:groups"?: string[];
  "custom:roles"?: string[];
  given_name?: string;
  family_name?: string;
  token_use?: string;
  auth_time?: number;
}

interface TokenValidationResult {
  valid: boolean;
  reason?: string;
  claims?: JwtClaims;
}

interface BlacklistedToken {
  jti: string;
  sub: string;
  exp: number;
  blacklistedAt: number;
  reason: string;
}

export class JwtSecurityManager {
  private static instance: JwtSecurityManager;
  private blacklistCache: Set<string> = new Set();
  private cacheExpiry: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): JwtSecurityManager {
    if (!JwtSecurityManager.instance) {
      JwtSecurityManager.instance = new JwtSecurityManager();
    }
    return JwtSecurityManager.instance;
  }

  async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      // Decode token to get claims
      const claims = jwtDecode<JwtClaims>(token);

      // Basic validation
      if (!claims || !claims.sub) {
        return { valid: false, reason: "Invalid token structure" };
      }

      // Check expiration
      if (claims.exp && claims.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false, reason: "Token expired" };
      }

      // Check issuer (Cognito)
      const expectedIssuer = `https://cognito-idp.${process.env.REGION}.amazonaws.com/${process.env.USER_POOL_ID}`;
      if (claims.iss && claims.iss !== expectedIssuer) {
        return { valid: false, reason: "Invalid issuer" };
      }

      // Check audience (Client ID)
      if (claims.aud && claims.aud !== process.env.USER_POOL_CLIENT_ID) {
        return { valid: false, reason: "Invalid audience" };
      }

      // Check token use
      if (claims.token_use && !["id", "access"].includes(claims.token_use)) {
        return { valid: false, reason: "Invalid token use" };
      }

      // Check if token is blacklisted
      const jti = this.extractJti(token);
      if (jti && (await this.isTokenBlacklisted(jti))) {
        return { valid: false, reason: "Token blacklisted" };
      }

      // Check issued at time (not too old)
      const maxAge = 24 * 60 * 60; // 24 hours
      if (claims.iat && claims.iat < Math.floor(Date.now() / 1000) - maxAge) {
        return { valid: false, reason: "Token too old" };
      }

      return { valid: true, claims };
    } catch (error) {
      return { valid: false, reason: "Token validation failed" };
    }
  }

  /**
   * Extract JTI (JWT ID) from token
   */
  private extractJti(token: string): string | null {
    try {
      const claims = jwtDecode<JwtClaims>(token);
      return claims.jti || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is blacklisted
   */
  private async isTokenBlacklisted(jti: string): Promise<boolean> {
    // Check cache first
    if (this.blacklistCache.has(jti)) {
      return true;
    }

    // Check if cache is expired
    if (Date.now() > this.cacheExpiry) {
      await this.refreshBlacklistCache();
    }

    return this.blacklistCache.has(jti);
  }

  /**
   * Refresh blacklist cache from DynamoDB
   */
  private async refreshBlacklistCache(): Promise<void> {
    try {
      // Get cache metadata
      const metadataResult = await ddb.send(
        new GetItemCommand({
          TableName: TOKEN_BLACKLIST_TABLE,
          Key: marshall({ jti: "cache_metadata" }),
        })
      );

      if (metadataResult.Item) {
        const metadata = unmarshall(metadataResult.Item) as any;
        this.cacheExpiry = metadata.expiry || 0;
      }

      // Clear old cache
      this.blacklistCache.clear();

      // Load recent blacklisted tokens with pagination
      await this.loadBlacklistedTokens();
    } catch (error) {
      console.error("Failed to refresh blacklist cache:", error);
    }
  }

  /**
   * Load blacklisted tokens with pagination
   */
  private async loadBlacklistedTokens(): Promise<void> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const batchSize = 100; // Load 100 tokens at a time
      let lastEvaluatedKey: any = undefined;
      let totalLoaded = 0;
      const maxTokensToLoad = 1000; // Limit total tokens in cache

      do {
        const scanParams: any = {
          TableName: TOKEN_BLACKLIST_TABLE,
          FilterExpression: "exp > :now",
          ExpressionAttributeValues: marshall({
            ":now": now,
          }),
          Limit: batchSize,
        };

        if (lastEvaluatedKey) {
          scanParams.ExclusiveStartKey = lastEvaluatedKey;
        }

        const result = (await ddb.send(new ScanCommand(scanParams))) as any;

        if (result.Items) {
          for (const item of result.Items) {
            const token = unmarshall(item) as BlacklistedToken;
            if (token.jti && token.jti !== "cache_metadata") {
              this.blacklistCache.add(token.jti);
              totalLoaded++;
            }
          }
        }

        lastEvaluatedKey = result.LastEvaluatedKey;

        // Stop if we've loaded enough tokens or reached the end
        if (totalLoaded >= maxTokensToLoad || !lastEvaluatedKey) {
          break;
        }
      } while (lastEvaluatedKey);

      // Update cache expiry
      this.cacheExpiry = now + this.CACHE_TTL / 1000;

      // Update metadata in DynamoDB
      await this.updateCacheMetadata(totalLoaded);
    } catch (error) {
      console.error("Failed to load blacklisted tokens:", error);
    }
  }

  /**
   * Update cache metadata in DynamoDB
   */
  private async updateCacheMetadata(tokenCount: number): Promise<void> {
    try {
      const metadata = {
        jti: "cache_metadata",
        expiry: this.cacheExpiry,
        tokenCount,
        lastUpdated: Math.floor(Date.now() / 1000),
      };

      await ddb.send(
        new PutItemCommand({
          TableName: TOKEN_BLACKLIST_TABLE,
          Item: marshall(metadata),
        })
      );
    } catch (error) {
      console.error("Failed to update cache metadata:", error);
    }
  }

  /**
   * Blacklist a token
   */
  async blacklistToken(
    token: string,
    reason: string = "logout"
  ): Promise<void> {
    try {
      const claims = jwtDecode<JwtClaims>(token);
      const jti = this.extractJti(token);

      if (!jti || !claims.sub || !claims.exp) {
        throw new Error("Invalid token for blacklisting");
      }

      const blacklistedToken: BlacklistedToken = {
        jti,
        sub: claims.sub,
        exp: claims.exp,
        blacklistedAt: Math.floor(Date.now() / 1000),
        reason,
      };

      await ddb.send(
        new PutItemCommand({
          TableName: TOKEN_BLACKLIST_TABLE,
          Item: marshall(blacklistedToken, { removeUndefinedValues: true }),
        })
      );

      // Add to cache
      this.blacklistCache.add(jti);
    } catch (error) {
      console.error("Failed to blacklist token:", error);
      throw error;
    }
  }

  /**
   * Get user roles from token claims
   */
  extractUserRoles(claims: JwtClaims): string[] {
    return claims["custom:roles"] || claims["cognito:groups"] || [];
  }

  /**
   * Validate token for specific endpoint
   */
  async validateTokenForEndpoint(
    token: string,
    endpoint: string
  ): Promise<TokenValidationResult> {
    const validation = await this.validateToken(token);

    if (!validation.valid || !validation.claims) {
      return validation;
    }

    // Additional endpoint-specific validation
    const roles = this.extractUserRoles(validation.claims);

    // Admin endpoints require admin role
    if (endpoint.includes("/admin") && !roles.includes("ADMIN")) {
      return { valid: false, reason: "Insufficient permissions" };
    }

    return validation;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; expiry: number; isExpired: boolean } {
    return {
      size: this.blacklistCache.size,
      expiry: this.cacheExpiry,
      isExpired: Date.now() > this.cacheExpiry * 1000,
    };
  }

  /**
   * Clean up expired blacklisted tokens from cache
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const tokensToRemove: string[] = [];

      // Check each cached token against its expiration
      for (const jti of this.blacklistCache) {
        try {
          // Get token details from DynamoDB
          const result = await ddb.send(
            new GetItemCommand({
              TableName: TOKEN_BLACKLIST_TABLE,
              Key: marshall({ jti }),
            })
          );

          if (result.Item) {
            const token = unmarshall(result.Item) as BlacklistedToken;
            if (token.exp && token.exp < now) {
              tokensToRemove.push(jti);
            }
          } else {
            // Token not found in DB, remove from cache
            tokensToRemove.push(jti);
          }
        } catch (error) {
          // If we can't verify the token, remove it from cache
          tokensToRemove.push(jti);
        }
      }

      // Remove expired tokens from cache
      for (const jti of tokensToRemove) {
        this.blacklistCache.delete(jti);
      }
    } catch (error) {
      console.error("Failed to cleanup expired tokens:", error);
    }
  }
}

// Export singleton instance
export const jwtSecurity = JwtSecurityManager.getInstance();
