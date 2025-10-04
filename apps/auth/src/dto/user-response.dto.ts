import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';
import { ResponseExamples } from '../app/swagger-examples';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: ResponseExamples.userResponse.id,
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: ResponseExamples.userResponse.email,
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'First name of the user',
    example: ResponseExamples.userResponse.firstName,
    minLength: 1,
    maxLength: 50,
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: ResponseExamples.userResponse.lastName,
    minLength: 1,
    maxLength: 50,
  })
  lastName: string;

  @ApiProperty({
    description: 'Role of the user in the system',
    enum: UserRole,
    example: ResponseExamples.userResponse.role,
    enumName: 'UserRole',
  })
  role: UserRole;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: ResponseExamples.userResponse.isActive,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Date and time when the user was created',
    example: ResponseExamples.userResponse.createdAt,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the user was last updated',
    example: ResponseExamples.userResponse.updatedAt,
    format: 'date-time',
  })
  updatedAt: Date;
}

