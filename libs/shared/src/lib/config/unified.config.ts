import { registerAs } from '@nestjs/config';

export interface UnifiedServiceConfig {
  name: string;
  port: number;
  microservicePort?: number;
  environment: string;
  cors: {
    origin: string[];
    credentials: boolean;
  };
  throttling: {
    ttl: number;
    limit: number;
  };
  health: {
    path: string;
    timeout: number;
  };
}

export const unifiedServiceConfig = registerAs('service', (): UnifiedServiceConfig => ({
  name: process.env.SERVICE_NAME || 'you-fizz-service',
  port: parseInt(process.env.PORT || '3000', 10),
  microservicePort: process.env.MICROSERVICE_PORT ? parseInt(process.env.MICROSERVICE_PORT, 10) : undefined,
  environment: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  throttling: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  health: {
    path: process.env.HEALTH_PATH || '/health',
    timeout: parseInt(process.env.HEALTH_TIMEOUT || '5000', 10),
  },
}));

// Service-specific port configurations
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
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
}));

export const userServiceConfig = registerAs('userService', () => ({
  port: parseInt(process.env.USER_SERVICE_PORT || '3002', 10),
  microservicePort: parseInt(process.env.USER_MICROSERVICE_PORT || '4002', 10),
}));

export const articleServiceConfig = registerAs('articleService', () => ({
  port: parseInt(process.env.ARTICLE_SERVICE_PORT || '3003', 10),
  microservicePort: parseInt(process.env.ARTICLE_MICROSERVICE_PORT || '4003', 10),
}));

export const cmdServiceConfig = registerAs('cmdService', () => ({
  port: parseInt(process.env.CMD_SERVICE_PORT || '3004', 10),
  microservicePort: parseInt(process.env.CMD_MICROSERVICE_PORT || '4004', 10),
}));

export const notificationServiceConfig = registerAs('notificationService', () => ({
  port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3005', 10),
  microservicePort: parseInt(process.env.NOTIFICATION_MICROSERVICE_PORT || '4005', 10),
}));

export const apiGatewayConfig = registerAs('apiGateway', () => ({
  port: parseInt(process.env.API_GATEWAY_PORT || '3000', 10),
  microservicePort: parseInt(process.env.API_GATEWAY_MICROSERVICE_PORT || '4000', 10),
}));
