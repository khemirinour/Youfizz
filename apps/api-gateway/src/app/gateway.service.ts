import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { getAuthServiceUrl, getArticleServiceUrl, getCmdServiceUrl, getNotificationServiceUrl } from '@you-fizz/shared';

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
    { service: 'auth', path: '/users/:id', method: 'GET', requiresAuth: true },
    { service: 'auth', path: '/users/:id', method: 'PATCH', requiresAuth: true },
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
    { service: 'auth', path: '/internal/vendors/confirm-quota', method: 'GET', requiresAuth: true, roles: ['vendeur', 'admin'] },
    
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
    
    // Category service endpoints
    { service: 'article', path: '/categories', method: 'GET', requiresAuth: false },
    { service: 'article', path: '/categories/tree', method: 'GET', requiresAuth: false },
    { service: 'article', path: '/categories', method: 'POST', requiresAuth: true, roles: ['admin', 'vendeur'] },
    { service: 'article', path: '/categories/:id', method: 'GET', requiresAuth: false },
    { service: 'article', path: '/categories/:id', method: 'PATCH', requiresAuth: true, roles: ['admin', 'vendeur'] },
    { service: 'article', path: '/categories/:id', method: 'DELETE', requiresAuth: true, roles: ['admin'] },
    
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
    // Use service URL utility functions for proper environment variable handling
    const serviceUrls: Record<string, string> = {
      auth: getAuthServiceUrl(),
      article: getArticleServiceUrl(),
      cmd: getCmdServiceUrl(),
      notification: getNotificationServiceUrl(),
      // User service - construct from config if needed, or add to utility
      user: (() => {
        const userServiceUrl = process.env.USER_SERVICE_URL;
        const userServiceHost = process.env.USER_SERVICE_HOST || 'localhost';
        const userServicePort = parseInt(process.env.USER_SERVICE_PORT || '3002', 10);
        const isProduction = process.env.NODE_ENV === 'production';
        
        if (userServiceUrl) return userServiceUrl;
        if (isProduction && userServiceHost === 'localhost') {
          throw new Error('USER_SERVICE_URL or USER_SERVICE_HOST must be configured in production');
        }
        return `http://${userServiceHost}:${userServicePort}`;
      })(),
    };

    const url = serviceUrls[service];
    if (!url) {
      throw new HttpException(`Service ${service} not configured`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return url;
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
      'if-none-match', // Block cache validation headers
      'if-modified-since',
    ]);
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      // Allow Cookie header to pass through for cookie forwarding
      if ((!blocked.has(lowerKey) || lowerKey === 'cookie') && value !== undefined && value !== null) {
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
    returnHeaders: boolean = false,
    cookies?: Record<string, string>,
    clientIp?: string,
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

    // Forward cookies from client to service
    // Priority: 1) Explicit cookies parameter, 2) Cookie header from request, 3) Construct from cookies object
    if (cookies && Object.keys(cookies).length > 0) {
      const cookieString = Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
      headers['Cookie'] = cookieString;
    } else if (headers['Cookie'] || headers['cookie']) {
      // Cookie header already exists, keep it (sanitizeHeaders allows it)
      // No action needed
    } else if (endpoint.requiresAuth) {
      // For authenticated endpoints, if no cookies provided, log warning
      // Cookies should be forwarded from the controller
      this.logger.warn(`No cookies forwarded for authenticated endpoint: ${method} ${pathname}`);
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

    // Extract client IP with priority: provided clientIp > existing X-Forwarded-For > unknown
    let forwardedForIp: string;
    if (clientIp && clientIp !== 'unknown') {
      // Use provided client IP
      forwardedForIp = clientIp;
      this.logger.log(`[GATEWAY] Forwarding request to ${endpoint.service}${forwardedPath} with client IP: ${forwardedForIp} (from parameter)`);
    } else if (headers['x-forwarded-for'] && headers['x-forwarded-for'] !== 'gateway') {
      // Use existing X-Forwarded-For if it's a real IP
      forwardedForIp = headers['x-forwarded-for'];
      this.logger.log(`[GATEWAY] Forwarding request to ${endpoint.service}${forwardedPath} with client IP: ${forwardedForIp} (from X-Forwarded-For header)`);
    } else {
      // Fallback - this shouldn't happen if trust proxy is enabled
      forwardedForIp = 'unknown';
      this.logger.warn(`[GATEWAY] Could not determine client IP for ${method} ${pathname}, using 'unknown'`);
    }

    const config: AxiosRequestConfig = {
      method: method.toLowerCase() as any,
      url: fullUrl,
      headers: {
        ...sanitized,
        ...(user ? { 'x-user-id': user.userId, 'x-user-role': user.role } : {}),
        'x-forwarded-for': forwardedForIp,
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Force fresh data
        'Pragma': 'no-cache', // HTTP/1.0 compatibility
      },
      timeout: 30000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      withCredentials: false, // Don't use axios cookie forwarding, we handle it manually via Cookie header
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
      const response = await lastValueFrom(this.httpService.request(config));
      
      // Add response validation
      if (!response) {
        this.logger.error(`Empty response from ${endpoint.service} for ${method} ${path}`);
        throw new HttpException('Empty response from service', HttpStatus.BAD_GATEWAY);
      }
      
      this.logger.debug(`Response status: ${response.status}, has data: ${!!response.data}`);
      
      // Handle 304 explicitly - but we need to return the ETag header for proper caching
      if (response.status === 304) {
        this.logger.log(`304 Not Modified for ${method} ${path}`);
        // For 304, we still need to return undefined, but the ETag header should be forwarded
        // The frontend will handle this with its cache
        return undefined;
      }
      
      // Validate data exists
      if (response.data === undefined || response.data === null) {
        this.logger.warn(`Response data is null/undefined for ${method} ${path}`);
      }
      
      // Extract Set-Cookie headers to forward to client
      const setCookieHeaders: string[] = [];
      if (response.headers['set-cookie']) {
        // Axios normalizes Set-Cookie headers to lowercase and returns as array
        const cookies = Array.isArray(response.headers['set-cookie']) 
          ? response.headers['set-cookie'] 
          : [response.headers['set-cookie']];
        setCookieHeaders.push(...cookies);
      }
      
      // Return data and headers if requested, otherwise just data (backward compatibility)
      if (returnHeaders) {
        return {
          data: response.data,
          headers: setCookieHeaders.length > 0 ? { 'set-cookie': setCookieHeaders } : undefined,
        };
      }
      return response.data;
    } catch (error: any) {
      // Enhanced error logging
      this.logger.error(
        `Error forwarding ${method} ${path} to ${endpoint.service} service:`,
        {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
          url: fullUrl,
        }
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
