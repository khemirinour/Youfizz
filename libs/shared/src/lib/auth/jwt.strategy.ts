import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
  type?: string;
  jti?: string; // JWT ID for token blacklisting
  vendorId?: string; // Vendor ID if user is a vendor
  confirmateurId?: string; // Confirmateur ID if user is a confirmateur
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('authService.jwtSecret');
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload) {
    // Validate token type
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Check if token is blacklisted (would need Redis/DB check in production)
    // For now, we'll trust the JWT signature validation
    
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
      vendorId: payload.vendorId,
      confirmateurId: payload.confirmateurId,
    };
  }
}


