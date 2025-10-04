import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthTestExamples } from '../app/swagger-examples';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token received via email. Must be a valid, non-expired token.',
    example: AuthTestExamples.passwordResetExecute.token,
    minLength: 32,
    maxLength: 64,
    pattern: '^[a-f0-9]{32,64}$',
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  token: string;

  @ApiProperty({
    description: 'New password for the user. Must be at least 8 characters long and contain uppercase, lowercase, number, and special character.',
    example: AuthTestExamples.passwordResetExecute.newPassword,
    minLength: 8,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  newPassword: string;
}
