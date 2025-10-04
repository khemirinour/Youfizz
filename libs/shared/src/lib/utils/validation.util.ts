import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { IsEmail, IsString, MinLength, Matches, IsOptional, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';

// Common validation decorators
export const IsValidEmail = () => IsEmail({}, { message: 'Please provide a valid email address' });

export const IsStrongPassword = () => [
  IsString({ message: 'Password must be a string' }),
  MinLength(8, { message: 'Password must be at least 8 characters long' }),
  Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  ),
];

export const IsValidName = (fieldName: string = 'Name') => [
  IsString({ message: `${fieldName} must be a string` }),
  MinLength(1, { message: `${fieldName} must be at least 1 character long` }),
];

export const IsValidUUID = (fieldName: string = 'ID') => IsUUID(4, { message: `${fieldName} must be a valid UUID` });

export const IsValidPagination = () => [
  IsOptional(),
  IsInt({ message: 'Page must be an integer' }),
  Min(1, { message: 'Page must be at least 1' }),
];

export const IsValidLimit = (maxLimit: number = 100) => [
  IsOptional(),
  IsInt({ message: 'Limit must be an integer' }),
  Min(1, { message: 'Limit must be at least 1' }),
  Max(maxLimit, { message: `Limit cannot exceed ${maxLimit}` }),
];

// Global validation pipe configuration
export const getGlobalValidationPipe = (): ValidationPipeOptions => ({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  validationError: {
    target: false,
    value: false,
  },
});

// Common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHANUMERIC_WITH_SPACES: /^[a-zA-Z0-9\s]+$/,
} as const;

