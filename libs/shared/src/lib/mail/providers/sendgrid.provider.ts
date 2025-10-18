import { MailProvider, MailMessage, MailProviderConfig } from '../mail-provider.interface';

export class SendgridMailProvider implements MailProvider {
  private apiKey: string;

  constructor(private config: MailProviderConfig) {
    if (!config.sendgrid?.apiKey) {
      throw new Error('SendGrid API key is required');
    }
    this.apiKey = config.sendgrid.apiKey;
  }

  async send(message: MailMessage): Promise<void> {
    // This would be implemented with actual SendGrid SDK
    // For now, we'll throw an error indicating it needs implementation
    throw new Error('SendGrid provider not implemented yet');
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
    return 'SendGrid';
  }
}
