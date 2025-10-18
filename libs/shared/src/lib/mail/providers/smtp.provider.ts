import * as nodemailer from 'nodemailer';
import { MailProvider, MailMessage, MailProviderConfig } from '../mail-provider.interface';

export class SmtpMailProvider implements MailProvider {
  private transporter: nodemailer.Transporter;

  constructor(private config: MailProviderConfig) {
    if (!config.smtp) {
      throw new Error('SMTP configuration is required');
    }

    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.auth,
    });
  }

  async send(message: MailMessage): Promise<void> {
    const mailOptions = {
      from: message.from || process.env.FROM_EMAIL || 'noreply@youfizz.com',
      to: Array.isArray(message.to) ? message.to.join(', ') : message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      attachments: message.attachments,
    };

    await this.transporter.sendMail(mailOptions);
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
    return 'SMTP';
  }
}
