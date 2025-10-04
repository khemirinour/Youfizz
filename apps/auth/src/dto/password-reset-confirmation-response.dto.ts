import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetConfirmationResponseDto {
  @ApiProperty({
    description: 'Whether the token is valid',
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'User email associated with the token (only if valid)',
    example: 'user@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Token expiration timestamp (only if valid)',
    example: '2024-01-15T14:30:00.000Z',
    required: false,
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Message describing the token status',
    example: 'Token is valid and ready for password reset',
  })
  message: string;
}


