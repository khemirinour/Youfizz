import { HttpException, HttpStatus, Logger } from '@nestjs/common';

export class AppError extends Error {
  public readonly statusCode: HttpStatus;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string = 'External service error') {
    super(`${service}: ${message}`, HttpStatus.BAD_GATEWAY);
  }
}

// Global error handler utility
export class ErrorHandler {
  private static readonly logger = new Logger(ErrorHandler.name);

  static handle(error: Error): HttpException {
    this.logger.error('Error occurred:', error);

    if (error instanceof AppError) {
      return new HttpException(
        {
          success: false,
          message: error.message,
          error: error.constructor.name,
          timestamp: new Date().toISOString(),
        },
        error.statusCode,
      );
    }

    // Handle known error types
    if (error.name === 'ValidationError') {
      return new HttpException(
        {
          success: false,
          message: 'Validation failed',
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (error.name === 'CastError') {
      return new HttpException(
        {
          success: false,
          message: 'Invalid data format',
          error: 'Invalid ID format',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Default error
    return new HttpException(
      {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static logError(error: Error, context?: string): void {
    const contextMessage = context ? `[${context}] ` : '';
    this.logger.error(`${contextMessage}Error:`, error.stack);
  }
}

