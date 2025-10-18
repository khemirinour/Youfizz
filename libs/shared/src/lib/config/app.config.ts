import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
  logging: boolean;
  retryAttempts: number;
  retryDelay: number;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  fromEmail: string;
  frontendUrl: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface RateLimitConfig {
  short: { ttl: number; limit: number };
  medium: { ttl: number; limit: number };
  long: { ttl: number; limit: number };
  authStrict: { ttl: number; limit: number };
  passwordReset: { ttl: number; limit: number };
  loginAttempts: { ttl: number; limit: number };
}

export interface ServiceConfig {
  name: string;
  port: number;
  microservicePort?: number;
  environment: string;
}

export const databaseConfig = registerAs('database', (): DatabaseConfig => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'you_fizz',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '10', 10),
  retryDelay: parseInt(process.env.DB_RETRY_DELAY || '3000', 10),
}));

export const emailConfig = registerAs('email', (): EmailConfig => ({
  host: process.env.SMTP_HOST || process.env.MAILHOG_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || process.env.MAILHOG_PORT || '1025', 10),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  fromEmail: process.env.FROM_EMAIL || 'noreply@youfizz.com',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
}));

export const redisConfig = registerAs('redis', (): RedisConfig => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
}));

export const rateLimitConfig = registerAs('rateLimit', (): RateLimitConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    short: {
      ttl: 1000,
      limit: isDevelopment ? 10 : 3,
    },
    medium: {
      ttl: 10000,
      limit: isDevelopment ? 50 : 20,
    },
    long: {
      ttl: 60000,
      limit: isDevelopment ? 200 : 100,
    },
    authStrict: {
      ttl: 300000,
      limit: isDevelopment ? 10 : 5,
    },
    passwordReset: {
      ttl: 300000,
      limit: isDevelopment ? 5 : 3,
    },
    loginAttempts: {
      ttl: 900000,
      limit: isDevelopment ? 20 : 10,
    },
  };
});

export const serviceConfig = registerAs('service', (): ServiceConfig => ({
  name: process.env.SERVICE_NAME || 'you-fizz',
  port: parseInt(process.env.PORT || '3000', 10),
  microservicePort: process.env.MICROSERVICE_PORT ? parseInt(process.env.MICROSERVICE_PORT, 10) : undefined,
  environment: process.env.NODE_ENV || 'development',
}));

// Service-specific configurations
export const authServiceConfig = registerAs('authService', () => ({
  port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
  microservicePort: parseInt(process.env.AUTH_MICROSERVICE_PORT || '4001', 10),
  jwtSecret: (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Missing required environment variable JWT_SECRET');
    }
    return secret;
  })(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
}));

export const userServiceConfig = registerAs('userService', () => ({
  port: parseInt(process.env.USER_SERVICE_PORT || '3002', 10),
  microservicePort: parseInt(process.env.USER_MICROSERVICE_PORT || '3002', 10),
}));

export const notificationServiceConfig = registerAs('notificationService', () => ({
  port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3003', 10),
  microservicePort: parseInt(process.env.NOTIFICATION_MICROSERVICE_PORT || '3003', 10),
}));

export const apiGatewayConfig = registerAs('apiGateway', () => ({
  port: parseInt(process.env.API_GATEWAY_PORT || '3000', 10),
}));

