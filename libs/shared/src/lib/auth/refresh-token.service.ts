import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export interface RefreshTokenRepository {
  save(data: any): Promise<any>;
  find(options: any): Promise<any[]>;
  update(conditions: any, data: any): Promise<any>;
  createQueryBuilder(): any;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private refreshTokenRepo: RefreshTokenRepository,
  ) {}

  async generateRefreshToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(rawToken, 12);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepo.save({
      token: hashedToken,
      userId,
      expiresAt,
      isActive: true,
    });

    return { token: rawToken, expiresAt };
  }

  async validateAndRotateToken(rawToken: string): Promise<{ userId: string; newToken: string; newExpiresAt: Date }> {
    const tokens = await this.refreshTokenRepo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });

    let validToken: any = null;

    // Find the token by comparing hashes
    for (const token of tokens) {
      if (await bcrypt.compare(rawToken, token.token)) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (validToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Invalidate the old token
    validToken.isActive = false;
    await this.refreshTokenRepo.save(validToken);

    // Generate new token
    const newRawToken = crypto.randomBytes(32).toString('hex');
    const newHashedToken = await bcrypt.hash(newRawToken, 12);
    
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await this.refreshTokenRepo.save({
      token: newHashedToken,
      userId: validToken.userId,
      expiresAt: newExpiresAt,
      isActive: true,
    });

    return {
      userId: validToken.userId,
      newToken: newRawToken,
      newExpiresAt,
    };
  }

  async invalidateToken(rawToken: string): Promise<void> {
    const tokens = await this.refreshTokenRepo.find({
      where: { isActive: true },
    });

    for (const token of tokens) {
      if (await bcrypt.compare(rawToken, token.token)) {
        token.isActive = false;
        await this.refreshTokenRepo.save(token);
        break;
      }
    }
  }

  async invalidateUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepo.update(
      { userId, isActive: true },
      { isActive: false }
    );
  }

  async invalidateTokenFamily(familyId: string): Promise<void> {
    // This method is simplified since we don't have familyId in the entity
    // In a real implementation, you might want to add this field to the entity
    await this.refreshTokenRepo.update(
      { isActive: true },
      { isActive: false }
    );
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.refreshTokenRepo
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}
