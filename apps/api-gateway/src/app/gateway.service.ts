import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ServiceEndpoint {
  service: string;
  path: string;
  method: string;
  requiresAuth: boolean;
  roles?: string[];
}

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private readonly serviceEndpoints: ServiceEndpoint[] = [
    // Auth service endpoints
    { service: 'auth', path: '/register', method: 'POST', requiresAuth: false },
    { service: 'auth', path: '/login', method: 'POST', requiresAuth: false },
    { service: 'auth', path: '/refresh', method: 'POST', requiresAuth: false },
    { service: 'auth', path: '/logout', method: 'POST', requiresAuth: true },
    { service: 'auth', path: '/users', method: 'GET', requiresAuth: true, roles: ['ADMIN'] },
    { service: 'auth', path: '/users/:id', method: 'GET', requiresAuth: true, roles: ['ADMIN'] },
    { service: 'auth', path: '/users/:id/role/:role', method: 'PATCH', requiresAuth: true, roles: ['ADMIN'] },
    { service: 'auth', path: '/users/:id/active', method: 'PATCH', requiresAuth: true, roles: ['ADMIN'] },
    { service: 'auth', path: '/users/:id', method: 'DELETE', requiresAuth: true, roles: ['ADMIN'] },
    
    // Article service endpoints
    { service: 'article', path: '/articles', method: 'GET', requiresAuth: false },
    { service: 'article', path: '/articles', method: 'POST', requiresAuth: true, roles: ['ADMIN', 'VENDEUR'] },
    { service: 'article', path: '/articles/:id', method: 'GET', requiresAuth: false },
    { service: 'article', path: '/articles/:id', method: 'PUT', requiresAuth: true, roles: ['ADMIN', 'VENDEUR'] },
    { service: 'article', path: '/articles/:id', method: 'DELETE', requiresAuth: true, roles: ['ADMIN'] },
    
    // CMD service endpoints
    { service: 'cmd', path: '/orders', method: 'GET', requiresAuth: true, roles: ['ADMIN', 'VENDEUR', 'CONFERMATEUR'] },
    { service: 'cmd', path: '/orders', method: 'POST', requiresAuth: true, roles: ['ADMIN', 'VENDEUR'] },
    { service: 'cmd', path: '/orders/:id', method: 'GET', requiresAuth: true, roles: ['ADMIN', 'VENDEUR', 'CONFERMATEUR'] },
    { service: 'cmd', path: '/orders/:id', method: 'PUT', requiresAuth: true, roles: ['ADMIN', 'VENDEUR', 'CONFERMATEUR'] },
    { service: 'cmd', path: '/orders/:id', method: 'DELETE', requiresAuth: true, roles: ['ADMIN'] },
    
    // User service endpoints
    { service: 'user', path: '/profile', method: 'GET', requiresAuth: true },
    { service: 'user', path: '/profile', method: 'PUT', requiresAuth: true },
    
    // Notification service endpoints
    { service: 'notification', path: '/notifications', method: 'GET', requiresAuth: true },
    { service: 'notification', path: '/notifications/:id/read', method: 'PATCH', requiresAuth: true },
  ];

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private getServiceUrl(service: string): string {
    const serviceConfigs = {
      auth: this.configService.get('authService'),
      user: this.configService.get('userService'),
      article: this.configService.get('articleService'),
      cmd: this.configService.get('cmdService'),
      notification: this.configService.get('notificationService'),
    };

    const config = serviceConfigs[service];
    if (!config) {
      throw new HttpException(`Service ${service} not configured`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return `http://localhost:${config.port}`;
  }

  private findEndpoint(path: string, method: string): ServiceEndpoint | null {
    return this.serviceEndpoints.find(endpoint => {
      const pathMatch = endpoint.path === path || 
        (endpoint.path.includes(':') && this.matchPathPattern(endpoint.path, path));
      return pathMatch && endpoint.method === method;
    });
  }

  private matchPathPattern(pattern: string, path: string): boolean {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    
    if (patternParts.length !== pathParts.length) return false;
    
    return patternParts.every((part, index) => {
      return part.startsWith(':') || part === pathParts[index];
    });
  }

  async forwardRequest(
    path: string,
    method: string,
    body: any,
    headers: Record<string, string>,
    user?: any,
  ): Promise<AxiosResponse> {
    const endpoint = this.findEndpoint(path, method);
    
    if (!endpoint) {
      throw new HttpException(`Endpoint not found: ${method} ${path}`, HttpStatus.NOT_FOUND);
    }

    // Check authentication requirements
    if (endpoint.requiresAuth && !user) {
      throw new HttpException('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    // Check role requirements
    if (endpoint.roles && user && !endpoint.roles.includes(user.role)) {
      throw new HttpException('Insufficient permissions', HttpStatus.FORBIDDEN);
    }

    const serviceUrl = this.getServiceUrl(endpoint.service);
    const fullUrl = `${serviceUrl}${path}`;

    const config: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url: fullUrl,
      headers: {
        ...headers,
        'x-user-id': user?.userId,
        'x-user-role': user?.role,
        'x-forwarded-for': headers['x-forwarded-for'] || 'gateway',
      },
      timeout: 30000,
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.data = body;
    }

    try {
      this.logger.log(`Forwarding ${method} ${path} to ${endpoint.service} service`);
      const response = await firstValueFrom(this.httpService.request(config));
      return response;
    } catch (error) {
      this.logger.error(`Error forwarding request to ${endpoint.service}:`, error.message);
      
      if (error.response) {
        throw new HttpException(
          error.response.data || 'Service error',
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      
      throw new HttpException('Service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  getServiceEndpoints(): ServiceEndpoint[] {
    return this.serviceEndpoints;
  }
}
