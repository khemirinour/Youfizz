import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const rateLimitingConfig: ThrottlerModuleOptions = [
  {
    name: 'short',
    ttl: 1000, // 1 second
    limit: 3, // 3 requests per second
  },
  {
    name: 'medium',
    ttl: 10000, // 10 seconds
    limit: 20, // 20 requests per 10 seconds
  },
  {
    name: 'long',
    ttl: 60000, // 1 minute
    limit: 100, // 100 requests per minute
  },
  // Sensitive endpoints - stricter limits
  {
    name: 'auth-strict',
    ttl: 300000, // 5 minutes
    limit: 5, // 5 requests per 5 minutes
  },
  {
    name: 'password-reset',
    ttl: 300000, // 5 minutes
    limit: 3, // 3 password reset requests per 5 minutes
  },
  {
    name: 'login-attempts',
    ttl: 900000, // 15 minutes
    limit: 10, // 10 login attempts per 15 minutes
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
        limit: 10, // More lenient for development
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
        name: 'auth-strict',
        ttl: 300000,
        limit: 10,
      },
      {
        name: 'password-reset',
        ttl: 300000,
        limit: 5,
      },
      {
        name: 'login-attempts',
        ttl: 900000,
        limit: 20,
      },
    ];
  }
  
  return rateLimitingConfig;
};


