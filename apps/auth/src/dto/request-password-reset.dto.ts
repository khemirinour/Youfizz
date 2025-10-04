import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthTestExamples } from '../app/swagger-examples';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Email address of the user requesting password reset. Must be a registered email in the system.',
    example: AuthTestExamples.passwordResetRequest.email,
    format: 'email',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
