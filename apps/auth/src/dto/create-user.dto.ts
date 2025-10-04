import { IsEmail, IsString, MinLength, IsOptional, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';
import { AuthTestExamples } from '../app/swagger-examples';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email address of the user. Must be a valid email format and unique across the system.',
    example: AuthTestExamples.registerSuccess.email,
    format: 'email',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Password for the user account. Must be at least 8 characters long and contain uppercase, lowercase, number, and special character.',
    example: AuthTestExamples.registerSuccess.password,
    minLength: 8,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @ApiProperty({
    description: 'First name of the user. Optional field for personalization.',
    example: AuthTestExamples.registerSuccess.firstName,
    required: false,
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the user. Optional field for personalization.',
    example: AuthTestExamples.registerSuccess.lastName,
    required: false,
    minLength: 1,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @ApiProperty({
    description: 'Role of the user in the system. Determines access permissions and capabilities.',
    enum: UserRole,
    example: AuthTestExamples.registerSuccess.role,
    required: false,
    enumName: 'UserRole',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role?: UserRole;
}

