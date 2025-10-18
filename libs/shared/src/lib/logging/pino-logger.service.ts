import { Injectable, LoggerService } from '@nestjs/common';
import pino from 'pino';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PinoLoggerService implements LoggerService {
  private readonly logger: pino.Logger;

  constructor(private configService: ConfigService) {
    const logLevel = this.configService.get<string>('LOG_LEVEL') || 'info';
    const logFormat = this.configService.get<string>('LOG_FORMAT') || 'json';
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';

    const config: pino.LoggerOptions = {
      level: logLevel,
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      base: {
        service: this.configService.get<string>('service.name') || 'you-fizz',
        version: process.env.npm_package_version || '1.0.0',
        environment: nodeEnv,
      },
    };

    if (logFormat === 'pretty' || nodeEnv === 'development') {
      this.logger = pino(config, pino.destination({
        dest: 1, // stdout
        sync: false,
      }));
    } else {
      this.logger = pino(config);
    }
  }

  log(message: any, context?: string): void {
    this.logger.info({ context }, message);
  }

  error(message: any, trace?: string, context?: string): void {
    this.logger.error({ context, trace }, message);
  }

  warn(message: any, context?: string): void {
    this.logger.warn({ context }, message);
  }

  debug(message: any, context?: string): void {
    this.logger.debug({ context }, message);
  }

  verbose(message: any, context?: string): void {
    this.logger.trace({ context }, message);
  }

  // Custom methods for structured logging
  logRequest(req: any, res: any, responseTime: number): void {
    this.logger.info({
      type: 'request',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    }, 'HTTP Request');
  }

  logError(error: Error, context?: string): void {
    this.logger.error({
      type: 'error',
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
    }, 'Application Error');
  }

  logSecurity(event: string, details: any): void {
    this.logger.warn({
      type: 'security',
      event,
      ...details,
    }, 'Security Event');
  }

  logBusiness(event: string, details: any): void {
    this.logger.info({
      type: 'business',
      event,
      ...details,
    }, 'Business Event');
  }
}
