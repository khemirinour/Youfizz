import { Logger, LogLevel } from '@nestjs/common';

export interface LogContext {
  service?: string;
  userId?: string;
  requestId?: string;
  operation?: string;
  [key: string]: any;
}

export class StructuredLogger {
  private readonly logger: Logger;
  private context: LogContext;

  constructor(context: string = 'Application', logContext: LogContext = {}) {
    this.logger = new Logger(context);
    this.context = logContext;
  }

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  private formatMessage(message: string, context?: LogContext): string {
    const mergedContext = { ...this.context, ...context };
    const contextString = Object.keys(mergedContext).length > 0 
      ? ` [${JSON.stringify(mergedContext)}]` 
      : '';
    return `${message}${contextString}`;
  }

  log(message: string, context?: LogContext): void {
    this.logger.log(this.formatMessage(message, context));
  }

  error(message: string, trace?: string, context?: LogContext): void {
    this.logger.error(this.formatMessage(message, context), trace);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.formatMessage(message, context));
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.formatMessage(message, context));
  }

  verbose(message: string, context?: LogContext): void {
    this.logger.verbose(this.formatMessage(message, context));
  }

  // Request/Response logging
  logRequest(method: string, url: string, userId?: string, requestId?: string): void {
    this.log(`Incoming ${method} request to ${url}`, {
      operation: 'request',
      method,
      url,
      userId,
      requestId,
    });
  }

  logResponse(method: string, url: string, statusCode: number, duration: number, userId?: string, requestId?: string): void {
    this.log(`Outgoing ${method} response from ${url} - ${statusCode} (${duration}ms)`, {
      operation: 'response',
      method,
      url,
      statusCode,
      duration,
      userId,
      requestId,
    });
  }

  // Business operation logging
  logOperation(operation: string, details: any, userId?: string): void {
    this.log(`Operation: ${operation}`, {
      operation,
      details,
      userId,
    });
  }

  // Error logging with context
  logError(error: Error, operation?: string, userId?: string, requestId?: string): void {
    this.error(`Error in ${operation || 'operation'}: ${error.message}`, error.stack, {
      operation,
      userId,
      requestId,
      errorName: error.name,
    });
  }
}

// Global logger instance
export const globalLogger = new StructuredLogger('YouFizz');

// Logging decorator for methods
export function LogOperation(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const logger = new StructuredLogger(target.constructor.name);

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      logger.logOperation(`${operation} started`, { args: args.length });

      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        logger.logOperation(`${operation} completed`, { duration });
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.logError(error as Error, operation);
        throw error;
      }
    };
  };
}
