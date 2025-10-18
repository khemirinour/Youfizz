import { MailProvider, MailMessage, MailProviderConfig } from '../mail-provider.interface';

export class AwsSesMailProvider implements MailProvider {
  private config: any;

  constructor(private providerConfig: MailProviderConfig) {
    if (!providerConfig.aws) {
      throw new Error('AWS configuration is required');
    }
    this.config = providerConfig.aws;
  }

  async send(message: MailMessage): Promise<void> {
    // This would be implemented with actual AWS SES SDK
    // For now, we'll throw an error indicating it needs implementation
    throw new Error('AWS SES provider not implemented yet');
  }

  async sendBulk(messages: MailMessage[]): Promise<void> {
    const promises = messages.map(message => this.send(message));
    await Promise.all(promises);
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getProviderName(): string {
    return 'AWS SES';
  }
}
