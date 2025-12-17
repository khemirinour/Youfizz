/**
 * Service URL utility for constructing service URLs from environment variables
 * Supports both full URL format and host:port format for flexibility
 */

export interface ServiceUrlConfig {
  url?: string;
  host?: string;
  port?: number;
  defaultPort: number;
  serviceName: string;
}

/**
 * Constructs a service URL from environment variables
 * Priority: 1) Full URL env var, 2) Construct from HOST + PORT, 3) Use localhost with default port (dev only)
 * 
 * @param config Configuration object with service details
 * @returns Full service URL (e.g., http://localhost:3001)
 */
export function getServiceUrl(config: ServiceUrlConfig): string {
  const { url, host, port, defaultPort, serviceName } = config;
  const isProduction = process.env.NODE_ENV === 'production';

  // Priority 1: Use full URL if provided
  if (url && url.trim()) {
    return url.trim();
  }

  // Priority 2: Construct from host and port
  const serviceHost = host || process.env[`${serviceName}_SERVICE_HOST`] || (isProduction ? undefined : 'localhost');
  const servicePort = port || parseInt(process.env[`${serviceName}_SERVICE_PORT`] || String(defaultPort), 10);

  if (serviceHost) {
    const protocol = process.env[`${serviceName}_SERVICE_PROTOCOL`] || 'http';
    return `${protocol}://${serviceHost}:${servicePort}`;
  }

  // Priority 3: Development fallback (localhost)
  if (!isProduction) {
    return `http://localhost:${servicePort}`;
  }

  // Production: throw error if not configured
  throw new Error(
    `Service URL for ${serviceName} is not configured. ` +
    `Please set ${serviceName}_SERVICE_URL or ${serviceName}_SERVICE_HOST environment variable.`
  );
}

/**
 * Get Auth Service URL
 */
export function getAuthServiceUrl(): string {
  return getServiceUrl({
    url: process.env.AUTH_SERVICE_URL,
    host: process.env.AUTH_SERVICE_HOST,
    port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
    defaultPort: 3001,
    serviceName: 'AUTH',
  });
}

/**
 * Get Article Service URL
 */
export function getArticleServiceUrl(): string {
  return getServiceUrl({
    url: process.env.ARTICLE_SERVICE_URL,
    host: process.env.ARTICLE_SERVICE_HOST,
    port: parseInt(process.env.ARTICLE_SERVICE_PORT || '3004', 10),
    defaultPort: 3004,
    serviceName: 'ARTICLE',
  });
}

/**
 * Get CMD Service URL
 */
export function getCmdServiceUrl(): string {
  return getServiceUrl({
    url: process.env.CMD_SERVICE_URL,
    host: process.env.CMD_SERVICE_HOST,
    port: parseInt(process.env.CMD_SERVICE_PORT || '3004', 10),
    defaultPort: 3004,
    serviceName: 'CMD',
  });
}

/**
 * Get Upload Service URL
 */
export function getUploadServiceUrl(): string {
  return getServiceUrl({
    url: process.env.UPLOAD_SERVICE_URL,
    host: process.env.UPLOAD_SERVICE_HOST,
    port: parseInt(process.env.UPLOAD_SERVICE_PORT || '3006', 10),
    defaultPort: 3006,
    serviceName: 'UPLOAD',
  });
}

/**
 * Get Notification Service URL
 */
export function getNotificationServiceUrl(): string {
  return getServiceUrl({
    url: process.env.NOTIFICATION_SERVICE_URL,
    host: process.env.NOTIFICATION_SERVICE_HOST,
    port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3005', 10),
    defaultPort: 3005,
    serviceName: 'NOTIFICATION',
  });
}

/**
 * Get API Gateway URL
 */
export function getApiGatewayUrl(): string {
  return getServiceUrl({
    url: process.env.API_GATEWAY_URL,
    host: process.env.API_GATEWAY_HOST || 'localhost',
    port: parseInt(process.env.API_GATEWAY_PORT || '3000', 10),
    defaultPort: 3000,
    serviceName: 'API_GATEWAY',
  });
}

