import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../utils/response.util';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already an ApiResponse, return it as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // If data is null or undefined, return success response
        if (data === null || data === undefined) {
          return ApiResponse.success('Operation completed successfully');
        }

        // Wrap data in ApiResponse
        return ApiResponse.success('Operation completed successfully', data);
      }),
    );
  }
}

