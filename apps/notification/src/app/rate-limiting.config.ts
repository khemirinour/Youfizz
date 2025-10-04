import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const rateLimitingConfig: ThrottlerModuleOptions = [
  {
    name: 'short',
    ttl: 1000, // 1 second
    limit: 5, // 5 requests per second
  },
  {
    name: 'medium',
    ttl: 10000, // 10 seconds
    limit: 30, // 30 requests per 10 seconds
  },
  {
    name: 'long',
    ttl: 60000, // 1 minute
    limit: 100, // 100 requests per minute
  },
  // Email-specific limits
  {
    name: 'email-strict',
    ttl: 60000, // 1 minute
    limit: 10, // 10 emails per minute
  },
  {
    name: 'password-reset-email',
    ttl: 300000, // 5 minutes
    limit: 5, // 5 password reset emails per 5 minutes
  },
];

// Rate limiting configuration for different environments
export const getRateLimitingConfig = (): ThrottlerModuleOptions => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // More lenient limits for development
    return [
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
      {
        name: 'email-strict',
        ttl: 60000,
        limit: 20,
      },
      {
        name: 'password-reset-email',
        ttl: 300000,
        limit: 10,
      },
    ];
  }
  
  return rateLimitingConfig;
};


