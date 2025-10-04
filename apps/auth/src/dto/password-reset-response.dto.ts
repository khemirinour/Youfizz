import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Password reset email sent successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Email address where the reset link was sent',
    example: 'user@example.com',
  })
  email: string;
}


