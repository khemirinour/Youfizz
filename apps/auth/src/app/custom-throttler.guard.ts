import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException, ThrottlerLimitDetail } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: ThrottlerLimitDetail): Promise<void> {
    const { limit, ttl, tracker } = throttlerLimitDetail;
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Get current count from tracker
    const currentCount = await this.getTracker(request);
    
    // Add rate limit headers
    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, limit - parseInt(currentCount)));
    response.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl).toISOString());
    
    // Custom error message based on endpoint
    const url = request.url;
    let message = 'Too many requests. Please try again later.';
    
    if (url.includes('/password-reset/request')) {
      message = 'Too many password reset requests. Please wait before trying again.';
    } else if (url.includes('/login')) {
      message = 'Too many login attempts. Please wait before trying again.';
    } else if (url.includes('/register')) {
      message = 'Too many registration attempts. Please wait before trying again.';
    } else if (url.includes('/password-reset/reset')) {
      message = 'Too many password reset attempts. Please wait before trying again.';
    }
    
    throw new ThrottlerException(message);
  }
}

