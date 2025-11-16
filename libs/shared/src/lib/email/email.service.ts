import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface PasswordResetEmailData {
  email: string;
  resetToken: string;
  firstName?: string;
}

export interface WelcomeEmailData {
  email: string;
  firstName?: string;
}

export interface ConfermateurAssignmentRequestEmailData {
  confermateurEmail: string;
  confermateurName: string;
  vendeurName: string;
  vendeurEmail: string;
  acceptUrl: string;
  refuseUrl: string;
}

export interface NotificationEmailData {
  email: string;
  subject: string;
  template: 'welcome' | 'password-reset' | 'notification';
  data: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const isDevelopment = false;
    
    if (isDevelopment) {
      // Use MailHog for development
      this.transporter = nodemailer.createTransport({
        host: process.env.MAILHOG_HOST || 'localhost',
        port: parseInt(process.env.MAILHOG_PORT || '1025'),
        secure: false,
        auth: null,
      });
    } else {
      // Use production email service (SMTP, SendGrid, etc.)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@youfizz.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${options.to}. MessageId: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${data.resetToken}`;
    
    const emailContent = this.generatePasswordResetEmailTemplate(data, resetUrl);
    
    await this.sendEmail({
      to: data.email,
      subject: 'Password Reset Request - YouFizz',
      html: emailContent.html,
      text: emailContent.text,
    });
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
    const emailContent = this.generateWelcomeEmailTemplate(data);
    
    await this.sendEmail({
      to: data.email,
      subject: 'Welcome to YouFizz!',
      html: emailContent.html,
      text: emailContent.text,
    });
  }

  async sendConfermateurAssignmentRequestEmail(data: ConfermateurAssignmentRequestEmailData): Promise<void> {
    const emailContent = this.generateConfermateurAssignmentRequestEmailTemplate(data);
    
    await this.sendEmail({
      to: data.confermateurEmail,
      subject: 'Vendeur Assignment Request - YouFizz',
      html: emailContent.html,
      text: emailContent.text,
    });
  }

  async sendNotificationEmail(data: NotificationEmailData): Promise<void> {
    const emailContent = this.generateNotificationEmailTemplate(data);
    
    await this.sendEmail({
      to: data.email,
      subject: data.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
  }

  private generatePasswordResetEmailTemplate(data: PasswordResetEmailData, resetUrl: string) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">YouFizz</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hello ${data.firstName || 'there'},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You have requested to reset your password for your YouFizz account. Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This link will expire in 1 hour for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #999; font-size: 12px; line-height: 1.4;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} YouFizz. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Password Reset Request - YouFizz
      
      Hello ${data.firstName || 'there'},
      
      You have requested to reset your password for your YouFizz account. 
      Click the link below to reset your password:
      
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email. 
      Your password will remain unchanged.
      
      Best regards,
      The YouFizz Team
    `;

    return { html, text };
  }

  private generateWelcomeEmailTemplate(data: WelcomeEmailData) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to YouFizz</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">YouFizz</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to YouFizz!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hello ${data.firstName || 'there'},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for registering with YouFizz! We're excited to have you on board and look forward to providing you with an amazing experience.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You can now start exploring our platform and all the features we have to offer. If you have any questions or need assistance, our support team is here to help.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Getting Started</h3>
              <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Complete your profile setup</li>
                <li>Explore our features and services</li>
                <li>Connect with other users</li>
                <li>Check out our help center for tips and guides</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              We're committed to providing you with the best possible experience. If you have any feedback or suggestions, we'd love to hear from you!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; margin: 0;">
                Best regards,<br>
                <strong>The YouFizz Team</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} YouFizz. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Welcome to YouFizz!
      
      Hello ${data.firstName || 'there'},
      
      Thank you for registering with YouFizz! We're excited to have you on board and look forward to providing you with an amazing experience.
      
      You can now start exploring our platform and all the features we have to offer. If you have any questions or need assistance, our support team is here to help.
      
      Getting Started:
      - Complete your profile setup
      - Explore our features and services
      - Connect with other users
      - Check out our help center for tips and guides
      
      We're committed to providing you with the best possible experience. If you have any feedback or suggestions, we'd love to hear from you!
      
      Best regards,
      The YouFizz Team
    `;

    return { html, text };
  }

  private generateNotificationEmailTemplate(data: NotificationEmailData) {
    // Generic notification template - can be extended based on template type
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${data.subject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">YouFizz</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">${data.subject}</h2>
            
            <div style="color: #666; line-height: 1.6;">
              ${data.data.content || 'You have a new notification from YouFizz.'}
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} YouFizz. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      ${data.subject}
      
      ${data.data.content || 'You have a new notification from YouFizz.'}
      
      Best regards,
      The YouFizz Team
    `;

    return { html, text };
  }

  private generateConfermateurAssignmentRequestEmailTemplate(data: ConfermateurAssignmentRequestEmailData) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vendeur Assignment Request</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">YouFizz</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Vendeur Assignment Request</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hello ${data.confermateurName},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <strong>${data.vendeurName}</strong> (${data.vendeurEmail}) has requested to be assigned to you as their confermateur.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Please review this request and choose to accept or refuse:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.acceptUrl}" 
                 style="display: inline-block; background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
                Accept
              </a>
              <a href="${data.refuseUrl}" 
                 style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Refuse
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px; font-size: 12px;">
              If the buttons don't work, you can copy and paste these links into your browser:<br>
              Accept: <a href="${data.acceptUrl}" style="color: #007bff;">${data.acceptUrl}</a><br>
              Refuse: <a href="${data.refuseUrl}" style="color: #007bff;">${data.refuseUrl}</a>
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} YouFizz. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      Vendeur Assignment Request - YouFizz
      
      Hello ${data.confermateurName},
      
      ${data.vendeurName} (${data.vendeurEmail}) has requested to be assigned to you as their confermateur.
      
      Please review this request and choose to accept or refuse:
      
      Accept: ${data.acceptUrl}
      Refuse: ${data.refuseUrl}
      
      Best regards,
      The YouFizz Team
    `;

    return { html, text };
  }
}
