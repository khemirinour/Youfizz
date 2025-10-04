import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '@you-fizz/shared';
import { TestUtils } from '@you-fizz/shared';

describe('EmailService', () => {
  let service: EmailService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await TestUtils.createTestingModule({
      providers: [EmailService],
    });
    service = module.get<EmailService>(EmailService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      const emailData = TestUtils.generateMockEmailData();
      
      // Mock the sendEmail method to avoid actual email sending
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue(undefined);
      
      await service.sendWelcomeEmail(emailData);
      
      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: emailData.email,
        subject: 'Welcome to YouFizz!',
        html: expect.any(String),
        text: expect.any(String),
      });
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const resetData = TestUtils.generateMockPasswordResetData();
      
      // Mock the sendEmail method to avoid actual email sending
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue(undefined);
      
      await service.sendPasswordResetEmail(resetData);
      
      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: resetData.email,
        subject: 'Password Reset Request - YouFizz',
        html: expect.any(String),
        text: expect.any(String),
      });
    });
  });
});

