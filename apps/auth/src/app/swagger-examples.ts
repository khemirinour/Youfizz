import { ApiProperty } from '@nestjs/swagger';

// Test data examples for Swagger documentation
export const AuthTestExamples = {
  // User Registration Examples
  registerSuccess: {
    email: 'john.doe@example.com',
    password: 'SecurePassword123!',
    firstName: 'John',
    lastName: 'Doe',
    role: 'GUEST'
  },
  
  registerWithRole: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN'
  },
  
  registerMinimal: {
    email: 'user@example.com',
    password: 'Password123!'
  },
  
  // Login Examples
  loginSuccess: {
    email: 'john.doe@example.com',
    password: 'SecurePassword123!'
  },
  
  loginAdmin: {
    email: 'admin@example.com',
    password: 'AdminPassword123!'
  },
  
  // Password Reset Examples
  passwordResetRequest: {
    email: 'john.doe@example.com'
  },
  
  passwordResetConfirm: {
    token: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
  },
  
  passwordResetExecute: {
    token: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    newPassword: 'NewSecurePassword123!'
  },
  
  // Refresh Token Examples
  refreshToken: {
    refreshToken: 'def456ghi789jkl012mno345pqr678stu901vwx234yzabc123'
  },
  
  // User Management Examples
  updateUserRole: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    role: 'VENDEUR'
  },
  
  setUserActive: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    isActive: false
  },
  
  // Error Examples
  validationError: {
    email: 'invalid-email',
    password: '123'
  },
  
  conflictError: {
    email: 'existing@example.com',
    password: 'Password123!'
  },
  
  unauthorizedError: {
    email: 'nonexistent@example.com',
    password: 'WrongPassword123!'
  }
};

export const NotificationTestExamples = {
  // Password Reset Email Examples
  passwordResetEmail: {
    email: 'john.doe@example.com',
    resetToken: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    firstName: 'John'
  },
  
  // Welcome Email Examples
  welcomeEmail: {
    email: 'newuser@example.com',
    firstName: 'Jane'
  },
  
  welcomeEmailMinimal: {
    email: 'user@example.com'
  }
};

// Response Examples
export const ResponseExamples = {
  // Auth Responses
  userResponse: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'GUEST',
    isActive: true,
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z'
  },
  
  authResponse: {
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'GUEST',
      isActive: true,
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z'
    },
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refreshToken: 'def456ghi789jkl012mno345pqr678stu901vwx234yzabc123',
    tokenType: 'Bearer',
    expiresIn: 900
  },
  
  passwordResetResponse: {
    message: 'If an account with this email exists, a password reset link has been sent.',
    email: 'john.doe@example.com'
  },
  
  passwordResetConfirmation: {
    isValid: true,
    email: 'john.doe@example.com',
    expiresAt: '2024-01-15T11:30:00.000Z',
    message: 'Token is valid and ready for password reset'
  },
  
  passwordResetConfirmationInvalid: {
    isValid: false,
    message: 'Invalid or expired reset token'
  },
  
  passwordResetSuccess: {
    message: 'Password has been reset successfully'
  },
  
  // Notification Responses
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
    message: 'Too many password reset requests. Please wait before trying again.',
    statusCode: 429,
    retryAfter: 300
  },
  
  validationError: {
    message: ['email must be a valid email address', 'password must be at least 8 characters long'],
    error: 'Bad Request',
    statusCode: 400
  },
  
  conflictError: {
    message: 'User with this email already exists',
    error: 'Conflict',
    statusCode: 409
  },
  
  unauthorizedError: {
    message: 'Invalid credentials',
    error: 'Unauthorized',
    statusCode: 401
  },
  
  notFoundError: {
    message: 'User not found',
    error: 'Bad Request',
    statusCode: 400
  }
};

// Test Scenarios
export const TestScenarios = {
  // Complete User Journey
  completeUserJourney: {
    name: 'Complete User Registration and Authentication Journey',
    steps: [
      {
        step: 1,
        action: 'Register new user',
        endpoint: 'POST /register',
        data: AuthTestExamples.registerSuccess,
        expectedStatus: 201,
        expectedResponse: 'UserResponseDto'
      },
      {
        step: 2,
        action: 'Login with credentials',
        endpoint: 'POST /login',
        data: AuthTestExamples.loginSuccess,
        expectedStatus: 200,
        expectedResponse: 'AuthResponseDto'
      },
      {
        step: 3,
        action: 'Refresh access token',
        endpoint: 'POST /refresh',
        data: AuthTestExamples.refreshToken,
        expectedStatus: 200,
        expectedResponse: 'AuthResponseDto'
      },
      {
        step: 4,
        action: 'Logout',
        endpoint: 'POST /logout',
        data: AuthTestExamples.refreshToken,
        expectedStatus: 200,
        expectedResponse: '{ message: string }'
      }
    ]
  },
  
  // Password Reset Journey
  passwordResetJourney: {
    name: 'Complete Password Reset Journey',
    steps: [
      {
        step: 1,
        action: 'Request password reset',
        endpoint: 'POST /password-reset/request',
        data: AuthTestExamples.passwordResetRequest,
        expectedStatus: 200,
        expectedResponse: 'PasswordResetResponseDto'
      },
      {
        step: 2,
        action: 'Confirm reset token',
        endpoint: 'POST /password-reset/confirm',
        data: AuthTestExamples.passwordResetConfirm,
        expectedStatus: 200,
        expectedResponse: 'PasswordResetConfirmationResponseDto'
      },
      {
        step: 3,
        action: 'Reset password',
        endpoint: 'POST /password-reset/reset',
        data: AuthTestExamples.passwordResetExecute,
        expectedStatus: 200,
        expectedResponse: '{ message: string }'
      }
    ]
  },
  
  // Rate Limiting Tests
  rateLimitingTests: {
    name: 'Rate Limiting Test Scenarios',
    scenarios: [
      {
        scenario: 'Login Rate Limiting',
        endpoint: 'POST /login',
        data: AuthTestExamples.loginSuccess,
        attempts: 11,
        expectedStatus: 429,
        rateLimit: '10 attempts per minute'
      },
      {
        scenario: 'Password Reset Rate Limiting',
        endpoint: 'POST /password-reset/request',
        data: AuthTestExamples.passwordResetRequest,
        attempts: 4,
        expectedStatus: 429,
        rateLimit: '3 attempts per 5 minutes'
      },
      {
        scenario: 'Registration Rate Limiting',
        endpoint: 'POST /register',
        data: AuthTestExamples.registerSuccess,
        attempts: 6,
        expectedStatus: 429,
        rateLimit: '5 attempts per minute'
      }
    ]
  },
  
  // Error Handling Tests
  errorHandlingTests: {
    name: 'Error Handling Test Scenarios',
    scenarios: [
      {
        scenario: 'Invalid Email Format',
        endpoint: 'POST /register',
        data: AuthTestExamples.validationError,
        expectedStatus: 400,
        expectedError: 'Validation Error'
      },
      {
        scenario: 'Duplicate Email Registration',
        endpoint: 'POST /register',
        data: AuthTestExamples.conflictError,
        expectedStatus: 409,
        expectedError: 'Conflict Error'
      },
      {
        scenario: 'Invalid Login Credentials',
        endpoint: 'POST /login',
        data: AuthTestExamples.unauthorizedError,
        expectedStatus: 401,
        expectedError: 'Unauthorized Error'
      },
      {
        scenario: 'Invalid Password Reset Token',
        endpoint: 'POST /password-reset/reset',
        data: {
          token: 'invalid-token',
          newPassword: 'NewPassword123!'
        },
        expectedStatus: 400,
        expectedError: 'Invalid or expired reset token'
      }
    ]
  }
};


