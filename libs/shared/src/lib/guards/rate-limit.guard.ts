import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { ThrottlerException, ThrottlerLimitDetail } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SharedRateLimitGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // This is a simplified rate limiting guard
    // In a real implementation, you would integrate with a proper rate limiting service
    // For now, we'll just return true to allow all requests
    return true;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const { limit, ttl, tracker } = throttlerLimitDetail;
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Add rate limit headers
    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, limit - 0));
    response.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl).toISOString());
    
    // Custom error message based on endpoint
    const url = request.url;
    const method = request.method;
    let message = 'Too many requests. Please try again later.';
    
    // Service-specific error messages
    if (url.includes('/password-reset/request')) {
      message = 'Too many password reset requests. Please wait before trying again.';
    } else if (url.includes('/login')) {
      message = 'Too many login attempts. Please wait before trying again.';
    } else if (url.includes('/register')) {
      message = 'Too many registration attempts. Please wait before trying again.';
    } else if (url.includes('/password-reset/reset')) {
      message = 'Too many password reset attempts. Please wait before trying again.';
    } else if (url.includes('/email/')) {
      message = 'Too many email requests. Please wait before trying again.';
    } else if (method === 'POST' && url.includes('/api/')) {
      message = 'Too many requests to this endpoint. Please wait before trying again.';
    }
    
    throw new ThrottlerException(message);
  }
}
