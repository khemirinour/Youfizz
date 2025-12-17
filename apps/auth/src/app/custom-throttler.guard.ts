import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException, ThrottlerLimitDetail } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(CustomThrottlerGuard.name);

  /**
   * Override getTracker to extract client IP with robust fallback logic
   * Priority: X-Forwarded-For header > req.ip > req.connection.remoteAddress > 'unknown'
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Try X-Forwarded-For header first (for gateway/proxy scenarios)
    const forwardedFor = req.headers?.['x-forwarded-for'];
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one (original client)
      const clientIp = Array.isArray(forwardedFor) 
        ? forwardedFor[0].split(',')[0].trim()
        : forwardedFor.split(',')[0].trim();
      
      // Validate it's not a placeholder value
      if (clientIp && clientIp !== 'gateway' && clientIp !== 'unknown') {
        this.logger.log(`[RATE-LIMIT] Using client IP from X-Forwarded-For: ${clientIp} for ${req.url}`);
        return clientIp;
      }
    }
    
    // Fallback to req.ip (works if trust proxy is enabled)
    if (req.ip && req.ip !== '127.0.0.1' && req.ip !== '::1' && req.ip !== '::ffff:127.0.0.1') {
      this.logger.log(`[RATE-LIMIT] Using client IP from req.ip: ${req.ip} for ${req.url}`);
      return req.ip;
    }
    
    // Last resort: connection remote address
    if (req.connection?.remoteAddress) {
      this.logger.log(`[RATE-LIMIT] Using client IP from connection.remoteAddress: ${req.connection.remoteAddress} for ${req.url}`);
      return req.connection.remoteAddress;
    }
    
    // Final fallback
    this.logger.warn(`[RATE-LIMIT] Could not determine client IP for ${req.url}, using 'unknown'`);
    return 'unknown';
  }

  protected async throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: ThrottlerLimitDetail): Promise<void> {
    const { limit, ttl, tracker } = throttlerLimitDetail;
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Get client IP for logging
    const clientIp = await this.getTracker(request);
    
    // Get current count - use the original approach from base class
    // The base class may have different logic, but we'll use a simple approach
    // The count should be available from the throttler's internal state
    // For now, we'll calculate remaining based on limit
    const currentCount = limit; // When exception is thrown, count equals limit
    
    // Log rate limit violation with IP
    this.logger.warn(`[RATE-LIMIT] Rate limit exceeded for IP: ${clientIp} on ${request.method} ${request.url} - Limit: ${limit} requests per ${ttl}ms`);
    
    // Add rate limit headers
    response.setHeader('X-RateLimit-Limit', limit);
    response.setHeader('X-RateLimit-Remaining', 0); // No remaining when limit exceeded
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

