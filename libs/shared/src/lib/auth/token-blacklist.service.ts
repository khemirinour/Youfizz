import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface BlacklistedToken {
  jti: string;
  userId: string;
  expiresAt: Date;
  reason: 'logout' | 'refresh' | 'security';
}

@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens = new Map<string, BlacklistedToken>();

  constructor(private configService: ConfigService) {}

  async blacklistToken(jti: string, userId: string, reason: 'logout' | 'refresh' | 'security' = 'logout'): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Keep blacklist for 24 hours

    this.blacklistedTokens.set(jti, {
      jti,
      userId,
      expiresAt,
      reason,
    });

    // Clean up expired tokens periodically
    this.cleanupExpiredTokens();
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const token = this.blacklistedTokens.get(jti);
    if (!token) return false;

    if (token.expiresAt < new Date()) {
      this.blacklistedTokens.delete(jti);
      return false;
    }

    return true;
  }

  async blacklistUserTokens(userId: string, reason: 'logout' | 'security' = 'logout'): Promise<void> {
    for (const [jti, token] of this.blacklistedTokens.entries()) {
      if (token.userId === userId) {
        token.reason = reason;
      }
    }
  }

  private cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [jti, token] of this.blacklistedTokens.entries()) {
      if (token.expiresAt < now) {
        this.blacklistedTokens.delete(jti);
      }
    }
  }

  // For production, this should use Redis or database
  async getBlacklistedTokens(): Promise<BlacklistedToken[]> {
    this.cleanupExpiredTokens();
    return Array.from(this.blacklistedTokens.values());
  }
}
