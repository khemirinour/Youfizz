import { Controller, Post, Body, ValidationPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SharedRateLimitGuard, EmailService, PasswordResetEmailData, WelcomeEmailData } from '@you-fizz/shared';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly emailService: EmailService) {}

  @Post('email/password-reset')
  @UseGuards(SharedRateLimitGuard)
  @Throttle({ short: { limit: 10, ttl: 60000 } }) // 10 password reset emails per minute
  @ApiOperation({ 
    summary: 'Send password reset email',
    description: 'Sends a password reset email to the specified user with a secure reset token. The email includes a reset link that expires in 1 hour.',
    tags: ['Email Notifications']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset email sent successfully',
    content: {
      'application/json': {
        example: {
          message: 'Password reset email sent successfully',
          email: 'john.doe@example.com'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation errors',
    content: {
      'application/json': {
        example: {
          message: ['email must be a valid email address'],
          error: 'Bad Request',
          statusCode: 400
        }
      }
    }
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Too many requests - rate limit exceeded',
    content: {
      'application/json': {
        example: {
          message: 'Too many password reset email requests. Please wait before trying again.',
          statusCode: 429,
          retryAfter: 60
        }
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Failed to send email - server error',
    content: {
      'application/json': {
        example: {
          message: 'Failed to send email: SMTP connection failed',
          error: 'Internal Server Error',
          statusCode: 500
        }
      }
    }
  })
  async sendPasswordResetEmail(
    @Body(ValidationPipe) data: PasswordResetEmailData
  ): Promise<{ message: string; email: string }> {
    await this.emailService.sendPasswordResetEmail(data);
    return {
      message: 'Password reset email sent successfully',
      email: data.email
    };
  }

  @Post('email/welcome')
  @UseGuards(SharedRateLimitGuard)
  @Throttle({ short: { limit: 20, ttl: 60000 } }) // 20 welcome emails per minute
  @ApiOperation({ summary: 'Send welcome email' })
  @ApiResponse({ 
    status: 200, 
    description: 'Welcome email sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Welcome email sent successfully' },
        email: { type: 'string', example: 'user@example.com' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Failed to send email' })
  async sendWelcomeEmail(
    @Body(ValidationPipe) data: WelcomeEmailData
  ): Promise<{ message: string; email: string }> {
    await this.emailService.sendWelcomeEmail(data);
    return {
      message: 'Welcome email sent successfully',
      email: data.email
    };
  }
}
