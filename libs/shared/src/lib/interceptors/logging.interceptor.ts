import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Request, Response } from 'express';
import { StructuredLogger } from '../utils/logging.util';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new StructuredLogger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const requestId = this.generateRequestId();

    // Add request ID to request object for use in other parts of the application
    (request as any).requestId = requestId;

    const startTime = Date.now();

    this.logger.logRequest(method, url, undefined, requestId);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;
        this.logger.logResponse(method, url, statusCode, duration, undefined, requestId);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;
        
        this.logger.logError(error, `${method} ${url}`, undefined, requestId);
        this.logger.logResponse(method, url, statusCode, duration, undefined, requestId);
        
        return throwError(() => error);
      }),
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

