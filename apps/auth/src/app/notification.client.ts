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
    // Use gateway URL if available, otherwise direct notification service URL
    // Gateway routes email endpoints, so we can use either gateway or direct service
    this.notificationServiceUrl = process.env.API_GATEWAY_URL || process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3000';
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

  async sendConfermateurAssignmentRequestEmail(data: {
    confermateurEmail: string;
    confermateurName: string;
    vendeurName: string;
    vendeurEmail: string;
    acceptUrl: string;
    refuseUrl: string;
  }): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.notificationServiceUrl}/api/notifications/email/confermateur-assignment-request`, data)
      );
      
      this.logger.log(`Confermateur assignment request email sent successfully to ${data.confermateurEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send confermateur assignment request email to ${data.confermateurEmail}:`, error.message);
      throw new Error(`Failed to send confermateur assignment request email: ${error.message}`);
    }
  }
}


