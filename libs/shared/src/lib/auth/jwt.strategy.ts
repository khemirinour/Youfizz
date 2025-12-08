import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
  type?: string;
  jti?: string; // JWT ID for token blacklisting
  vendorId?: string; // Vendor ID if user is a vendor
  confirmateurId?: string; // Confirmateur ID if user is a confirmateur
}

// Custom extractor to get token from cookies first, then Authorization header
const cookieExtractor = (req: Request): string | null => {
  // Try to get token from parsed cookies first (when cookie-parser is used)
  if (req && req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  
  // Fallback: Parse Cookie header manually if cookies weren't parsed
  if (req && req.headers && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc: Record<string, string>, cookie: string) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});
    if (cookies.accessToken) {
      return cookies.accessToken;
    }
  }
  
  // Final fallback to Authorization header for backward compatibility
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('authService.jwtSecret');
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }
    
    super({
      jwtFromRequest: cookieExtractor,
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


