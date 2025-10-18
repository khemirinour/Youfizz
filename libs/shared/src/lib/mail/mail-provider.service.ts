import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailProvider, MailMessage, MailProviderConfig } from './mail-provider.interface';
import { SmtpMailProvider } from './providers/smtp.provider';
import { SendgridMailProvider } from './providers/sendgrid.provider';
import { AwsSesMailProvider } from './providers/aws-ses.provider';

@Injectable()
export class MailProviderService {
  private readonly logger = new Logger(MailProviderService.name);
  private readonly provider: MailProvider;

  constructor(private configService: ConfigService) {
    const providerType = this.configService.get<string>('MAIL_PROVIDER') || 'smtp';
    const config = this.getProviderConfig(providerType);
    this.provider = this.createProvider(providerType, config);
  }

  private getProviderConfig(provider: string): MailProviderConfig {
    const baseConfig: MailProviderConfig = {
      provider: provider as any,
    };

    switch (provider) {
      case 'smtp':
        baseConfig.smtp = {
          host: this.configService.get<string>('SMTP_HOST') || 'localhost',
          port: this.configService.get<number>('SMTP_PORT') || 1025,
          secure: this.configService.get<boolean>('SMTP_SECURE') || false,
          auth: this.configService.get<string>('SMTP_USER') ? {
            user: this.configService.get<string>('SMTP_USER'),
            pass: this.configService.get<string>('SMTP_PASS'),
          } : undefined,
        };
        break;

      case 'sendgrid':
        baseConfig.sendgrid = {
          apiKey: this.configService.get<string>('SENDGRID_API_KEY'),
        };
        break;

      case 'aws-ses':
        baseConfig.aws = {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
          region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
        };
        break;

      default:
        this.logger.warn(`Unknown mail provider: ${provider}, falling back to SMTP`);
        return this.getProviderConfig('smtp');
    }

    return baseConfig;
  }

  private createProvider(provider: string, config: MailProviderConfig): MailProvider {
    switch (provider) {
      case 'smtp':
        return new SmtpMailProvider(config);
      case 'sendgrid':
        return new SendgridMailProvider(config);
      case 'aws-ses':
        return new AwsSesMailProvider(config);
      default:
        this.logger.warn(`Unknown mail provider: ${provider}, falling back to SMTP`);
        return new SmtpMailProvider(this.getProviderConfig('smtp'));
    }
  }

  async send(message: MailMessage): Promise<void> {
    try {
      this.logger.debug(`Sending email to ${Array.isArray(message.to) ? message.to.join(', ') : message.to}`);
      await this.provider.send(message);
      this.logger.log(`Email sent successfully to ${Array.isArray(message.to) ? message.to.join(', ') : message.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendBulk(messages: MailMessage[]): Promise<void> {
    try {
      this.logger.debug(`Sending ${messages.length} emails in bulk`);
      await this.provider.sendBulk(messages);
      this.logger.log(`Bulk email sent successfully for ${messages.length} messages`);
    } catch (error) {
      this.logger.error(`Failed to send bulk emails: ${error.message}`, error.stack);
      throw error;
    }
  }

  validateEmail(email: string): boolean {
    return this.provider.validateEmail(email);
  }

  getProviderName(): string {
    return this.provider.getProviderName();
  }
}
