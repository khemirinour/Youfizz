import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  database?: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime?: number;
  };
  redis?: {
    status: 'connected' | 'disconnected' | 'error';
    responseTime?: number;
  };
  dependencies?: {
    [key: string]: {
      status: 'ok' | 'error';
      responseTime?: number;
      error?: string;
    };
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(private configService: ConfigService) {}

  async getHealthStatus(): Promise<HealthCheckResult> {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal + memoryUsage.external;
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    const health: HealthCheckResult = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: this.configService.get<string>('service.name') || 'unknown',
      version: process.env.npm_package_version || '1.0.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      memory: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round(memoryPercentage * 100) / 100,
      },
    };

    // Add database health check
    try {
      const dbStart = Date.now();
      // This would be replaced with actual database ping
      health.database = {
        status: 'connected',
        responseTime: Date.now() - dbStart,
      };
    } catch (error) {
      health.database = {
        status: 'error',
      };
      health.status = 'error';
    }

    // Add Redis health check
    try {
      const redisStart = Date.now();
      // This would be replaced with actual Redis ping
      health.redis = {
        status: 'connected',
        responseTime: Date.now() - redisStart,
      };
    } catch (error) {
      health.redis = {
        status: 'error',
      };
      health.status = 'error';
    }

    return health;
  }

  async getDetailedHealthStatus(): Promise<HealthCheckResult> {
    const basicHealth = await this.getHealthStatus();
    
    // Add dependency checks
    const dependencies: { [key: string]: any } = {};
    
    // Check external services
    const services = [
      { name: 'auth', url: `http://localhost:${this.configService.get('authService.port')}/health` },
      { name: 'user', url: `http://localhost:${this.configService.get('userService.port')}/health` },
      { name: 'article', url: `http://localhost:${this.configService.get('articleService.port')}/health` },
      { name: 'cmd', url: `http://localhost:${this.configService.get('cmdService.port')}/health` },
      { name: 'notification', url: `http://localhost:${this.configService.get('notificationService.port')}/health` },
    ];

    for (const service of services) {
      try {
        const start = Date.now();
        // This would be replaced with actual HTTP health check
        dependencies[service.name] = {
          status: 'ok',
          responseTime: Date.now() - start,
        };
      } catch (error) {
        dependencies[service.name] = {
          status: 'error',
          error: error.message,
        };
        basicHealth.status = 'error';
      }
    }

    return {
      ...basicHealth,
      dependencies,
    };
  }
}
