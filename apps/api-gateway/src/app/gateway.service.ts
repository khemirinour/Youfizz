import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

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
    { service: 'auth', path: '/logout-all', method: 'POST', requiresAuth: true },
    { service: 'auth', path: '/users', method: 'GET', requiresAuth: true, roles: ['admin'] },
    { service: 'auth', path: '/users/:id', method: 'GET', requiresAuth: true, roles: ['admin'] },
    { service: 'auth', path: '/roles', method: 'GET', requiresAuth: true },
    { service: 'auth', path: '/users/:id/role/:role', method: 'PATCH', requiresAuth: true, roles: ['admin'] },
    { service: 'auth', path: '/users/:id/active', method: 'PATCH', requiresAuth: true, roles: ['admin'] },
    { service: 'auth', path: '/users/:id/vendeur/nbr-cmd-conf', method: 'PATCH', requiresAuth: true, roles: ['admin'] },
    { service: 'auth', path: '/users/:id', method: 'DELETE', requiresAuth: true, roles: ['admin'] },
    { service: 'auth', path: '/vendeurs/:vendeurId/confermateurs', method: 'GET', requiresAuth: true, roles: ['vendeur', 'admin'] },
    { service: 'auth', path: '/vendeurs/:vendeurId/confermateurs/:confermateurId', method: 'DELETE', requiresAuth: true, roles: ['vendeur'] },
    { service: 'auth', path: '/confermateurs', method: 'GET', requiresAuth: true },
    { service: 'auth', path: '/confermateurs/:confermateurId/vendeurs', method: 'GET', requiresAuth: true, roles: ['confermateur'] },
    { service: 'auth', path: '/confermateurs/:confermateurId/vendeurs/:vendeurId', method: 'POST', requiresAuth: true, roles: ['admin'] },
    { service: 'auth', path: '/confermateurs/:confermateurId/vendeurs/:vendeurId', method: 'DELETE', requiresAuth: true, roles: ['admin'] },
    { service: 'auth', path: '/confermateurs/:confermateurId/accept-vendeur/:vendeurId', method: 'GET', requiresAuth: false },
    { service: 'auth', path: '/confermateurs/:confermateurId/accept-vendeur/:vendeurId', method: 'POST', requiresAuth: false },
    { service: 'auth', path: '/confermateurs/:confermateurId/refuse-vendeur/:vendeurId', method: 'GET', requiresAuth: false },
    { service: 'auth', path: '/confermateurs/:confermateurId/refuse-vendeur/:vendeurId', method: 'POST', requiresAuth: false },
    { service: 'auth', path: '/vendeurs/:vendeurId/request-confermateur', method: 'POST', requiresAuth: true, roles: ['vendeur'] },
    { service: 'auth', path: '/users/by-email/:email', method: 'GET', requiresAuth: false },
    { service: 'auth', path: '/password-reset/request', method: 'POST', requiresAuth: false },
    { service: 'auth', path: '/password-reset/confirm', method: 'POST', requiresAuth: false },
    { service: 'auth', path: '/password-reset/reset', method: 'POST', requiresAuth: false },
    { service: 'auth', path: '/stats/users', method: 'GET', requiresAuth: true, roles: ['admin'] },
    
    // Article service endpoints
    { service: 'article', path: '/articles', method: 'GET', requiresAuth: false },
    { service: 'article', path: '/articles', method: 'POST', requiresAuth: true, roles: ['admin', 'vendeur'] },
    { service: 'article', path: '/articles/:id', method: 'GET', requiresAuth: false },
    { service: 'article', path: '/articles/vendor/:vendorId', method: 'GET', requiresAuth: false },
    { service: 'article', path: '/articles/:id', method: 'PUT', requiresAuth: true, roles: ['admin', 'vendeur'] },
    { service: 'article', path: '/articles/:id', method: 'PATCH', requiresAuth: true, roles: ['admin', 'vendeur'] },
    { service: 'article', path: '/articles/:id', method: 'DELETE', requiresAuth: true, roles: ['admin'] },
    { service: 'article', path: '/articles/:id/activate', method: 'PATCH', requiresAuth: true, roles: ['admin', 'vendeur'] },
    { service: 'article', path: '/articles/:id/deactivate', method: 'PATCH', requiresAuth: true, roles: ['admin', 'vendeur'] },
    { service: 'article', path: '/articles/:id/images', method: 'POST', requiresAuth: true, roles: ['admin', 'vendeur'] },
    { service: 'article', path: '/articles/:id/images/multiple', method: 'POST', requiresAuth: true, roles: ['admin', 'vendeur'] },
    { service: 'article', path: '/articles/:id/images', method: 'DELETE', requiresAuth: true, roles: ['admin', 'vendeur'] },
    { service: 'article', path: '/stats/articles', method: 'GET', requiresAuth: true, roles: ['admin'] },
    
    // CMD service endpoints
    { service: 'cmd', path: '/orders', method: 'GET', requiresAuth: true, roles: ['admin', 'vendeur', 'confermateur'] },
    { service: 'cmd', path: '/orders', method: 'POST', requiresAuth: false }, // Changed to false - guest orders allowed
    { service: 'cmd', path: '/orders/:id', method: 'GET', requiresAuth: true, roles: ['admin', 'vendeur', 'confermateur'] },
    { service: 'cmd', path: '/orders/:id', method: 'PUT', requiresAuth: true, roles: ['admin', 'vendeur', 'confermateur'] },
    { service: 'cmd', path: '/orders/:id', method: 'PATCH', requiresAuth: true, roles: ['admin', 'vendeur', 'confermateur'] },
    { service: 'cmd', path: '/orders/:id', method: 'DELETE', requiresAuth: true, roles: ['admin'] },
    { service: 'cmd', path: '/orders/:id/confirm', method: 'PATCH', requiresAuth: true, roles: ['vendeur', 'confermateur'] },
    { service: 'cmd', path: '/orders/:id/activate', method: 'PATCH', requiresAuth: true, roles: ['admin', 'vendeur', 'confermateur'] },
    { service: 'cmd', path: '/orders/:id/deactivate', method: 'PATCH', requiresAuth: true, roles: ['admin', 'vendeur', 'confermateur'] },
    { service: 'cmd', path: '/stats/orders', method: 'GET', requiresAuth: true, roles: ['admin'] },
    
    // User service endpoints
    { service: 'user', path: '/profile', method: 'GET', requiresAuth: true },
    { service: 'user', path: '/profile', method: 'PUT', requiresAuth: true },
    
    // Notification service endpoints
    { service: 'notification', path: '/notifications', method: 'GET', requiresAuth: true },
    { service: 'notification', path: '/notifications/:id/read', method: 'PATCH', requiresAuth: true },
    { service: 'notification', path: '/notifications/email/password-reset', method: 'POST', requiresAuth: false },
    { service: 'notification', path: '/notifications/email/welcome', method: 'POST', requiresAuth: false },
    { service: 'notification', path: '/notifications/email/confermateur-assignment-request', method: 'POST', requiresAuth: false },
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

  private sanitizeHeaders(headers: Record<string, string> = {}, isMultipart: boolean = false): Record<string, string> {
    const blocked = new Set([
      'host',
      'content-length',
      'transfer-encoding',
      'connection',
      'accept-encoding',
      'content-encoding',
    ]);
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      if (!blocked.has(lowerKey) && value !== undefined && value !== null) {
        result[key] = value as unknown as string;
      }
    }
    // Don't override Content-Type for multipart requests
    if (!isMultipart && !result['Content-Type'] && !result['content-type']) {
      result['Content-Type'] = 'application/json';
    }
    return result;
  }

  async forwardRequest(
    path: string,
    method: string,
    body: any,
    headers: Record<string, string>,
    user?: any,
    isMultipart: boolean = false,
  ): Promise<any> {
    const [pathname, queryString] = path.split('?');
    const endpoint = this.findEndpoint(pathname, method);
    
    if (!endpoint) {
      throw new HttpException(`Endpoint not found: ${method} ${pathname}`, HttpStatus.NOT_FOUND);
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
    // Add special handling for stats endpoints
    let forwardedPath = pathname;
    if (endpoint.service === 'cmd' && pathname === '/stats/orders') {
      forwardedPath = '/orders/stats/orders';
    } else if (endpoint.service === 'article' && pathname === '/stats/articles') {
      forwardedPath = '/articles/stats/articles';
    }
    const fullUrl = `${serviceUrl}/api${forwardedPath}`;

    const sanitized = this.sanitizeHeaders(headers, isMultipart);

    const config: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url: fullUrl,
      headers: {
        ...sanitized,
        ...(user ? { 'x-user-id': user.userId, 'x-user-role': user.role } : {}),
        'x-forwarded-for': headers['x-forwarded-for'] || 'gateway',
      },
      timeout: 30000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: (status) => {
        // Treat 2xx and 3xx (including 304 Not Modified) as success
        return status >= 200 && status < 400;
      },
    };

    if (queryString) {
      const params = Object.fromEntries(new URLSearchParams(queryString) as any);
      (config as any).params = params;
    }

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.data = body;
    }

    try {
      this.logger.log(`Forwarding ${method} ${path} to ${endpoint.service} service`);
      const response = await firstValueFrom(this.httpService.request(config));
      
      // If backend returns 304 Not Modified, return undefined to indicate no change
      // This allows the frontend to preserve existing state
      if (response.status === 304) {
        return undefined;
      }
      
      return response.data; // Return only the data, not the full Axios response
    } catch (error: any) {
      this.logger.error(
        `Error forwarding ${method} ${path} to ${endpoint.service} service:`,
        error?.message || 'Unknown error'
      );
      
      if (error?.response) {
        this.logger.error(
          `Response status: ${error.response.status}, URL: ${fullUrl}`
        );
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
