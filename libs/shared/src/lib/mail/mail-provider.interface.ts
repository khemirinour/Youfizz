export interface MailMessage {
  to: string | string[];
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: MailAttachment[];
}

export interface MailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  disposition?: 'attachment' | 'inline';
  cid?: string;
}

export interface MailProvider {
  send(message: MailMessage): Promise<void>;
  sendBulk(messages: MailMessage[]): Promise<void>;
  validateEmail(email: string): boolean;
  getProviderName(): string;
}

export interface MailProviderConfig {
  provider: 'smtp' | 'sendgrid' | 'aws-ses' | 'mailgun';
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
  };
  aws?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  mailgun?: {
    apiKey: string;
    domain: string;
  };
}
