# API Testing Guide

This document provides comprehensive instructions for testing all API endpoints of the Auth Service, including the newly integrated SendGrid email verification functionality.

## Prerequisites

1. Node.js (v16 or higher)
2. PostgreSQL database running locally
3. SendGrid API key (optional for development)
4. npm packages installed (`npm install`)
5. Prisma client generated (`npx prisma generate`)

## Environment Setup

### 1. Create .env file

Copy the `.env.example` file and create a `.env` file:

```bash
cp .env.example .env
```

Update the following variables:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/authdb
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000
EMAIL_FROM=no-reply@example.com
SENDGRID_API_KEY=  # Leave empty for development (logs to console)
LOG_LEVEL=debug
```

### 2. Create Database

```bash
# Run migrations (this creates all tables)
npx prisma migrate dev --name init
```

### 3. Start the Server

```bash
npm run dev
```

The server should start on `http://localhost:4000`

## Testing Methods

### Method 1: Using Jest Unit Tests

Run the existing unit tests:

```bash
npm test
```

This will run all tests in the `src/tests/` directory.

Run specific test file:

```bash
npm test -- src/tests/auth.test.ts
npm test -- src/tests/auth-integration.test.ts
npm test -- src/tests/email.test.ts
```

### Method 2: Using Shell Script (Integration Tests)

Run the comprehensive API integration tests using curl:

```bash
./test-api.sh
```

This script tests:
- User registration with various scenarios
- Login with valid/invalid credentials
- Email verification endpoints
- Password reset flow
- User profile endpoint
- Logout functionality

### Method 3: Manual Testing with cURL

#### 1. Register a User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

Expected Response (201):
```json
{
  "id": "uuid-here",
  "email": "john@example.com"
}
```

**Key Points:**
- Name is optional but recommended for personalized emails
- Password should be at least 8 characters
- Email must be unique

#### 2. Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

Expected Response (200):
```json
{
  "accessToken": "jwt-token-here",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "roles": ["USER"]
  }
}
```

Also sets a `refreshToken` cookie in the response.

#### 3. Verify Email

First, check the console/logs to find the verification token (in development mode):

```
[DEV MODE] Verification email would be sent to john@example.com
```

Then verify using the token from registration response:

```bash
curl -X GET "http://localhost:4000/api/auth/verify-email?token=VERIFICATION_TOKEN_HERE"
```

Expected Response (200):
```json
{
  "ok": true
}
```

#### 4. Forgot Password

```bash
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

Expected Response (200):
```json
{
  "ok": true
}
```

**Note:** This always returns `ok: true` even if email doesn't exist (for security reasons).

#### 5. Reset Password

```bash
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_HERE",
    "newPassword": "NewSecurePass123!"
  }'
```

Expected Response (200):
```json
{
  "ok": true
}
```

#### 6. Get User Profile

```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer ACCESS_TOKEN_HERE"
```

Expected Response (200):
```json
{
  "id": "uuid-here",
  "name": "John Doe",
  "email": "john@example.com",
  "roles": ["USER"],
  "emailVerified": false
}
```

#### 7. Logout

```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected Response (200):
```json
{
  "ok": true
}
```

## API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|-----------------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/refresh-token` | No | Refresh access token |
| POST | `/api/auth/logout` | No | Logout user |
| GET | `/api/auth/verify-email` | No | Verify email with token |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Reset password with token |
| GET | `/api/auth/me` | Yes | Get user profile |

## Email Service Testing

### Development Mode (Without SendGrid API Key)

When `SENDGRID_API_KEY` is not set, emails are logged to the console:

```
[DEV MODE] Verification email would be sent to john@example.com
Link: http://localhost:3000/verify-email?token=...
```

### Production Mode (With SendGrid API Key)

1. Get SendGrid API key from https://app.sendgrid.com/settings/api_keys
2. Add to `.env`:
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   ```
3. Ensure `EMAIL_FROM` is a verified sender in SendGrid

Emails will now be sent via SendGrid API.

## Email Verification Flow

### Complete Flow

1. **User registers**
   ```bash
   POST /api/auth/register
   → Email token is created and stored in database
   → Verification email is sent (or logged in dev mode)
   → User receives email with verification link
   ```

2. **User clicks verification link**
   ```
   User visits: http://frontend:3000/verify-email?token=TOKEN
   Frontend calls: GET /api/auth/verify-email?token=TOKEN
   ```

3. **Email is verified**
   ```bash
   GET /api/auth/verify-email?token=TOKEN
   → Token is validated
   → User's emailVerified field set to true
   → Token is marked as used
   ```

### Testing Email Verification

**In Development Mode:**

1. When user registers, check server logs for:
   ```
   [DEV MODE] Verification email would be sent to user@example.com
   ```

2. Find the token from the registration response or database query:
   ```bash
   # In another terminal, query database (requires direct DB access)
   # Or check the response body structure
   ```

**In Production Mode:**

1. User registers → Email is sent to their inbox
2. User clicks "Verify Email" button in email
3. Frontend redirects to `/verify-email?token=...`
4. API verifies the token and marks email as verified

## Troubleshooting

### Error: "DATABASE_URL is not set"
- Ensure `.env` file exists with `DATABASE_URL` configured
- Check PostgreSQL is running: `pg_isready`

### Error: "SENDGRID_API_KEY is not set"
- This is normal in development mode
- Emails will be logged to console instead
- Add API key to `.env` for production testing

### Error: "Email token expired"
- Token expires after 24 hours for verification
- Token expires after 1 hour for password reset
- User needs to request a new token

### Tests fail with connection errors
- Ensure database is running
- Check `DATABASE_URL` in `.env`
- Run migrations: `npx prisma migrate dev`

### Port 4000 already in use
- Change PORT in `.env`
- Or kill existing process: `lsof -ti:4000 | xargs kill`

## Monitoring Email Sending

### Console Logging (Development)

All email activities are logged. Set `LOG_LEVEL=debug` for verbose output:

```bash
LOG_LEVEL=debug npm run dev
```

### SendGrid Dashboard (Production)

Monitor sent emails in SendGrid:
- https://app.sendgrid.com/email_activity
- Check bounce rates and delivery status
- Monitor email suppression lists

## Performance Notes

- Token hashing uses bcrypt with 12 salt rounds
- Tokens are one-time use (marked as `used` after verification)
- Expired tokens are cleaned up automatically
- Refresh token rotation is supported

## Security Considerations

1. **Password Reset:** Users requesting password reset for non-existent emails don't leak information
2. **Email Tokens:** Tokens are hashed in database, raw tokens only sent via email
3. **Rate Limiting:** Not implemented - consider adding in production
4. **HTTPS Only:** Ensure frontend URL uses HTTPS in production
5. **CORS:** Configured to allow requests from FRONTEND_URL

## Next Steps

1. Run integration tests: `./test-api.sh`
2. Monitor console for email logs
3. Test SendGrid integration with API key
4. Set up email templates in SendGrid
5. Configure domain verification for sender address
