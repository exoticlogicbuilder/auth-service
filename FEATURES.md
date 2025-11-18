# Auth Service - Combined Features

## Overview
This auth microservice combines functionality from multiple branches (excluding SendGrid-related branches) to provide a complete authentication solution.

## Branch Integration Summary

### ✅ Combined Branches

1. **main branch** - Base implementation with all core features
   - User registration with email verification tokens
   - Login with JWT access and refresh tokens
   - Token refresh and rotation
   - Logout with token revocation
   - Email verification flow
   - Password reset flow
   - RBAC (User/Admin/Reviewer roles)
   - Prisma schema with PostgreSQL

2. **jwt-auth-middleware-7d-session-management** features
   - JWT middleware with 7-day token expiry
   - Enhanced token verification with proper error handling
   - TokenExpiredError and JsonWebTokenError handling
   - Protected routes with JWT authentication
   - Session management with refresh token rotation

3. **feature/user-registration-bcrypt-jwt-validation** features
   - Password validation (min 8 chars, uppercase, number)
   - Email format validation
   - Name validation
   - Bcrypt password hashing
   - Duplicate email detection and 409 Conflict response
   - Input validation with descriptive error messages

4. **fix/auth-handle-prisma-unique-email** features
   - Proper handling of Prisma unique constraint errors
   - Duplicate email registration prevention
   - Better error handling for database operations

5. **docs/api-endpoints-features-unit-integration-tests-results** features
   - Comprehensive documentation
   - API endpoint documentation
   - Test results and examples
   - Architecture documentation

### ❌ Excluded Branches (SendGrid SMTP)

The following branches were **NOT** included as per requirements:
- `feat-sendgrid-smtp-relay-email-verification`
- `feat/auth-email-verification-sendgrid`
- `feat/email-verification-sendgrid`
- `fix-sendgrid-email-verification-register-endpoint`

## Current Implementation

### Authentication Features

#### 1. User Registration
- **Endpoint:** `POST /api/auth/register`
- Email verification token generation
- Password validation (min 8 chars, 1 uppercase, 1 number)
- Bcrypt password hashing
- Duplicate email prevention (409 Conflict)
- Name and email validation

#### 2. User Login
- **Endpoint:** `POST /api/auth/login`
- Credential validation
- JWT access token generation (7-day expiry)
- Refresh token generation and storage
- HTTP-only cookie for refresh token

#### 3. Token Refresh
- **Endpoint:** `POST /api/auth/refresh-token`
- Token rotation mechanism
- Old token revocation
- New access token generation
- Refresh token replacement

#### 4. Logout
- **Endpoint:** `POST /api/auth/logout`
- Refresh token revocation
- Cookie clearing

#### 5. Email Verification
- **Endpoint:** `POST /api/auth/verify-email`
- Token-based verification
- One-time use tokens
- Token expiry validation (24 hours)

#### 6. Password Reset
- **Forgot Password:** `POST /api/auth/forgot-password`
  - Reset token generation
  - Security: success response for all emails
- **Reset Password:** `POST /api/auth/reset-password`
  - Token validation
  - Password validation
  - Token expiry check (1 hour)

#### 7. Protected Routes
- **Endpoint:** `GET /api/protected/me`
- JWT authentication required
- User profile retrieval
- Role information

#### 8. RBAC (Role-Based Access Control)
- Three roles: USER, ADMIN, REVIEWER
- Role-based middleware for endpoint protection
- Role information in JWT tokens

#### 9. Internal Token Verification
- **Endpoint:** `POST /api/auth/internal/verify-token`
- Service-to-service token verification
- Token payload extraction
- Expiry and validity checks

### Email Service (Logger-based)

**No external email provider required!**

The email service logs verification and reset emails to the console/logs instead of sending actual emails. This is perfect for:
- Development and testing
- Local development without external dependencies
- CI/CD pipelines
- Cost-effective deployment

Email logs include:
- Verification/reset links
- Recipient information
- Token information

### Security Features

1. **Password Security**
   - Bcrypt hashing with configurable salt rounds
   - Password strength validation
   - Minimum 8 characters, uppercase, number required

2. **Token Security**
   - JWT with unique JTI (JWT ID)
   - Token hashing in database
   - Token rotation to prevent reuse
   - Token revocation on logout
   - Separate access and refresh tokens

3. **Input Validation**
   - Email format validation
   - Name validation
   - Password strength validation
   - Zod schemas for request validation

4. **Error Handling**
   - Proper HTTP status codes (400, 401, 409, etc.)
   - Descriptive error messages
   - TokenExpiredError handling
   - JsonWebTokenError handling

## Running the Service

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your database URL and JWT secrets:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/authdb
   JWT_ACCESS_SECRET=your_secure_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

6. Start the server:
   ```bash
   npm run dev
   ```

The service will run on port 4000 (configurable via PORT in .env).

### API Documentation

Once running, access:
- Swagger UI: `http://localhost:4000/api/docs`
- Health check: `http://localhost:4000/health`

### Testing

Run the test suite:
```bash
npm test
```

Test coverage includes:
- JWT unit tests
- Authentication integration tests
- Email service tests
- Auth service unit tests

## Database Schema

### User Model
- UUID identifier
- Name (optional)
- Email (unique)
- Password hash (bcrypt)
- Email verification status
- Roles array (USER, ADMIN, REVIEWER)
- Timestamps (createdAt, updatedAt)

### RefreshToken Model
- Token hash (bcrypt)
- User relationship
- Expiry timestamp
- Revocation status
- Token replacement tracking

### EmailToken Model
- Token hash (bcrypt)
- Type (verify, reset)
- User relationship
- Expiry timestamp
- Used status
- Creation timestamp

## Technology Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** Zod
- **Logging:** Winston
- **Testing:** Jest + Supertest
- **API Documentation:** Swagger/OpenAPI

## Next Steps

To add actual email functionality in the future:
1. Choose an email provider (SendGrid, AWS SES, etc.)
2. Update `src/services/email.service.ts`
3. Add provider API keys to `.env`
4. Keep the current logger fallback for development

## Documentation

- [README.md](./README.md) - Quick start guide
- [DOCUMENTATION.md](./DOCUMENTATION.md) - Comprehensive documentation
- [FEATURES.md](./FEATURES.md) - This file (feature overview)
