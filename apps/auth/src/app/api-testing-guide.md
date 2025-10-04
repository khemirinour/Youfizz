# YouFizz Auth API Testing Guide

## Overview
This guide provides comprehensive testing instructions for the YouFizz Authentication API. The API includes user registration, login, password reset, and user management endpoints with rate limiting and security features.

## Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://api.youfizz.com`

## Authentication
Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Test Scenarios

### 1. Complete User Registration and Authentication Flow

#### Step 1: Register New User
```bash
POST /register
Content-Type: application/json

{
  "email": "test.user@example.com",
  "password": "SecurePassword123!",
  "firstName": "Test",
  "lastName": "User",
  "role": "GUEST"
}
```

**Expected Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "test.user@example.com",
  "firstName": "Test",
  "lastName": "User",
  "role": "GUEST",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Step 2: Login User
```bash
POST /login
Content-Type: application/json

{
  "email": "test.user@example.com",
  "password": "SecurePassword123!"
}
```

**Expected Response (200):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "test.user@example.com",
    "firstName": "Test",
    "lastName": "User",
    "role": "GUEST",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "def456ghi789jkl012mno345pqr678stu901vwx234yzabc123",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

#### Step 3: Refresh Access Token
```bash
POST /refresh
Content-Type: application/json

{
  "refreshToken": "def456ghi789jkl012mno345pqr678stu901vwx234yzabc123"
}
```

#### Step 4: Logout
```bash
POST /logout
Content-Type: application/json

{
  "refreshToken": "def456ghi789jkl012mno345pqr678stu901vwx234yzabc123"
}
```

### 2. Password Reset Flow

#### Step 1: Request Password Reset
```bash
POST /password-reset/request
Content-Type: application/json

{
  "email": "test.user@example.com"
}
```

**Expected Response (200):**
```json
{
  "message": "If an account with this email exists, a password reset link has been sent.",
  "email": "test.user@example.com"
}
```

#### Step 2: Confirm Reset Token
```bash
POST /password-reset/confirm
Content-Type: application/json

{
  "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
}
```

**Expected Response (200):**
```json
{
  "isValid": true,
  "email": "test.user@example.com",
  "expiresAt": "2024-01-15T11:30:00.000Z",
  "message": "Token is valid and ready for password reset"
}
```

#### Step 3: Reset Password
```bash
POST /password-reset/reset
Content-Type: application/json

{
  "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "newPassword": "NewSecurePassword123!"
}
```

**Expected Response (200):**
```json
{
  "message": "Password has been reset successfully"
}
```

### 3. Rate Limiting Tests

#### Test Login Rate Limiting
Make 11 consecutive login requests with invalid credentials:

```bash
# Repeat this request 11 times
POST /login
Content-Type: application/json

{
  "email": "test.user@example.com",
  "password": "WrongPassword123!"
}
```

**Expected Response (429) after 10 attempts:**
```json
{
  "message": "Too many login attempts. Please wait before trying again.",
  "statusCode": 429,
  "retryAfter": 60
}
```

**Rate Limit Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-01-15T11:30:00.000Z
Retry-After: 60
```

### 4. Error Handling Tests

#### Invalid Email Format
```bash
POST /register
Content-Type: application/json

{
  "email": "invalid-email",
  "password": "Password123!"
}
```

**Expected Response (400):**
```json
{
  "message": ["email must be a valid email address"],
  "error": "Bad Request",
  "statusCode": 400
}
```

#### Weak Password
```bash
POST /register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123"
}
```

**Expected Response (400):**
```json
{
  "message": [
    "password must be at least 8 characters long",
    "password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

#### Duplicate Email Registration
```bash
POST /register
Content-Type: application/json

{
  "email": "existing@example.com",
  "password": "Password123!"
}
```

**Expected Response (409):**
```json
{
  "message": "User with this email already exists",
  "error": "Conflict",
  "statusCode": 409
}
```

#### Invalid Login Credentials
```bash
POST /login
Content-Type: application/json

{
  "email": "nonexistent@example.com",
  "password": "WrongPassword123!"
}
```

**Expected Response (401):**
```json
{
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "statusCode": 401
}
```

## Rate Limiting

### Endpoint-Specific Limits

| Endpoint | Limit | Window | Description |
|----------|-------|--------|-------------|
| `/register` | 5 requests | 1 minute | Prevent spam registrations |
| `/login` | 10 requests | 1 minute | Prevent brute force attacks |
| `/password-reset/request` | 3 requests | 5 minutes | Prevent email flooding |
| `/password-reset/confirm` | 10 requests | 1 minute | Allow reasonable token validation |
| `/password-reset/reset` | 5 requests | 5 minutes | Prevent password reset abuse |

### Rate Limit Headers
All rate-limited endpoints return these headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Timestamp when the limit resets
- `Retry-After`: Seconds to wait before retrying

## Test Data

### Valid Test Users
```json
{
  "email": "test.user@example.com",
  "password": "SecurePassword123!",
  "firstName": "Test",
  "lastName": "User",
  "role": "GUEST"
}
```

### Admin User
```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123!",
  "firstName": "Admin",
  "lastName": "User",
  "role": "ADMIN"
}
```

### Invalid Test Data
```json
{
  "invalidEmail": "not-an-email",
  "weakPassword": "123",
  "shortPassword": "pass",
  "noSpecialChar": "Password123"
}
```

## Postman Collection

Import the provided `postman-collection.json` file into Postman for automated testing. The collection includes:

1. **Authentication Flow**: Complete registration and login flow
2. **Password Reset Flow**: Full password reset process
3. **Rate Limiting Tests**: Tests for rate limit enforcement
4. **Error Handling Tests**: Tests for various error scenarios

### Running Tests in Postman

1. Import the collection
2. Set the `baseUrl` variable to your API endpoint
3. Run the collection or individual test folders
4. Check the test results in the Postman test runner

## Automated Testing

### Using Newman (Postman CLI)
```bash
# Install Newman
npm install -g newman

# Run the collection
newman run postman-collection.json -e environment.json

# Run with HTML report
newman run postman-collection.json -e environment.json -r html --reporter-html-export report.html
```

### Using cURL
```bash
# Register user
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!","firstName":"Test","lastName":"User"}'

# Login user
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'
```

## Security Testing

### JWT Token Validation
1. Extract access token from login response
2. Use token in Authorization header for protected endpoints
3. Test token expiration by waiting for expiry time
4. Test invalid token handling

### Password Security
1. Test password strength requirements
2. Test password hashing (passwords should not be stored in plain text)
3. Test password reset token security

### Rate Limiting Security
1. Test rate limit enforcement
2. Test rate limit bypass attempts
3. Test rate limit reset behavior

## Performance Testing

### Load Testing with Artillery
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Auth Flow"
    weight: 100
    flow:
      - post:
          url: "/register"
          json:
            email: "user{{ $randomInt(1, 1000) }}@example.com"
            password: "Password123!"
            firstName: "Test"
            lastName: "User"
```

```bash
# Run load test
artillery run artillery-config.yml
```

## Monitoring and Debugging

### Logs to Monitor
- Authentication attempts
- Rate limit violations
- Password reset requests
- Token refresh operations

### Debug Headers
- `X-Request-ID`: Unique request identifier
- `X-Response-Time`: Request processing time
- `X-RateLimit-*`: Rate limiting information

## Troubleshooting

### Common Issues

1. **429 Too Many Requests**
   - Wait for rate limit window to reset
   - Check `Retry-After` header for wait time

2. **401 Unauthorized**
   - Check if token is valid and not expired
   - Verify token format in Authorization header

3. **400 Bad Request**
   - Check request body format
   - Validate required fields
   - Check data types and constraints

4. **500 Internal Server Error**
   - Check server logs
   - Verify database connectivity
   - Check external service dependencies

### Debug Mode
Set environment variable for detailed error responses:
```bash
NODE_ENV=development
DEBUG=auth:*
```

This comprehensive testing guide ensures thorough validation of the YouFizz Auth API functionality, security, and performance.
