import { ApiProperty } from '@nestjs/swagger';

// Test data examples for Swagger documentation
export const NotificationTestExamples = {
  // Password Reset Email Examples
  passwordResetEmail: {
    email: 'john.doe@example.com',
    resetToken: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    firstName: 'John'
  },
  
  passwordResetEmailMinimal: {
    email: 'user@example.com',
    resetToken: 'def456ghi789jkl012mno345pqr678stu901vwx234yzabc123'
  },
  
  // Welcome Email Examples
  welcomeEmail: {
    email: 'newuser@example.com',
    firstName: 'Jane'
  },
  
  welcomeEmailMinimal: {
    email: 'user@example.com'
  },
  
  // Error Examples
  invalidEmail: {
    email: 'invalid-email-format'
  },
  
  missingEmail: {
    firstName: 'John'
  }
};

// Response Examples
export const NotificationResponseExamples = {
  // Success Responses
  emailSent: {
    message: 'Password reset email sent successfully',
    email: 'john.doe@example.com'
  },
  
  welcomeEmailSent: {
    message: 'Welcome email sent successfully',
    email: 'newuser@example.com'
  },
  
  // Error Responses
  rateLimitError: {
    message: 'Too many password reset email requests. Please wait before trying again.',
    statusCode: 429,
    retryAfter: 60
  },
  
  validationError: {
    message: ['email must be a valid email address'],
    error: 'Bad Request',
    statusCode: 400
  },
  
  emailServiceError: {
    message: 'Failed to send email: SMTP connection failed',
    error: 'Internal Server Error',
    statusCode: 500
  }
};

// Test Scenarios
export const NotificationTestScenarios = {
  // Email Sending Tests
  emailSendingTests: {
    name: 'Email Sending Test Scenarios',
    scenarios: [
      {
        scenario: 'Send Password Reset Email',
        endpoint: 'POST /notifications/email/password-reset',
        data: NotificationTestExamples.passwordResetEmail,
        expectedStatus: 200,
        expectedResponse: 'Email sent successfully'
      },
      {
        scenario: 'Send Welcome Email',
        endpoint: 'POST /notifications/email/welcome',
        data: NotificationTestExamples.welcomeEmail,
        expectedStatus: 200,
        expectedResponse: 'Email sent successfully'
      },
      {
        scenario: 'Send Email with Minimal Data',
        endpoint: 'POST /notifications/email/welcome',
        data: NotificationTestExamples.welcomeEmailMinimal,
        expectedStatus: 200,
        expectedResponse: 'Email sent successfully'
      }
    ]
  },
  
  // Rate Limiting Tests
  rateLimitingTests: {
    name: 'Email Rate Limiting Test Scenarios',
    scenarios: [
      {
        scenario: 'Password Reset Email Rate Limiting',
        endpoint: 'POST /notifications/email/password-reset',
        data: NotificationTestExamples.passwordResetEmail,
        attempts: 11,
        expectedStatus: 429,
        rateLimit: '10 emails per minute'
      },
      {
        scenario: 'Welcome Email Rate Limiting',
        endpoint: 'POST /notifications/email/welcome',
        data: NotificationTestExamples.welcomeEmail,
        attempts: 21,
        expectedStatus: 429,
        rateLimit: '20 emails per minute'
      }
    ]
  },
  
  // Error Handling Tests
  errorHandlingTests: {
    name: 'Email Error Handling Test Scenarios',
    scenarios: [
      {
        scenario: 'Invalid Email Format',
        endpoint: 'POST /notifications/email/password-reset',
        data: NotificationTestExamples.invalidEmail,
        expectedStatus: 400,
        expectedError: 'Validation Error'
      },
      {
        scenario: 'Missing Required Fields',
        endpoint: 'POST /notifications/email/welcome',
        data: NotificationTestExamples.missingEmail,
        expectedStatus: 400,
        expectedError: 'Validation Error'
      }
    ]
  }
};


