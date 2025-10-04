import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface PasswordResetEmailData {
  email: string;
  resetToken: string;
  firstName?: string;
}

export interface WelcomeEmailData {
  email: string;
  firstName?: string;
}

@Injectable()
export class NotificationClient {
  private readonly logger = new Logger(NotificationClient.name);
  private readonly notificationServiceUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.notificationServiceUrl}/api/notifications/email/password-reset`, data)
      );
      
      this.logger.log(`Password reset email sent successfully to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${data.email}:`, error.message);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.notificationServiceUrl}/api/notifications/email/welcome`, data)
      );
      
      this.logger.log(`Welcome email sent successfully to ${data.email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${data.email}:`, error.message);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }
}


