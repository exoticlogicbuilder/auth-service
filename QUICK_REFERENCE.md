# Quick Reference & Test Scenarios

## Table of Contents

1. [Quick Start](#quick-start)
2. [API Endpoints Summary](#api-endpoints-summary)
3. [cURL Test Examples](#curl-test-examples)
4. [Postman Collection](#postman-collection)
5. [Test Scenarios](#test-scenarios)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database URL and secrets

# 3. Generate Prisma client
npx prisma generate

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Start development
npm run dev

# 6. Run tests
npm test
```

### First Request
```bash
# Health check (no auth required)
curl http://localhost:3000/health

# Expected response:
# {"ok":true}
```

---

## API Endpoints Summary

### Authentication Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | ❌ | Create new user account |
| POST | `/api/auth/login` | ❌ | Authenticate user |
| POST | `/api/auth/refresh-token` | ❌ | Get new access token |
| POST | `/api/auth/logout` | ❌ | Logout & revoke token |
| GET | `/api/auth/verify-email` | ❌ | Verify email address |
| POST | `/api/auth/forgot-password` | ❌ | Request password reset |
| POST | `/api/auth/reset-password` | ❌ | Reset password with token |
| GET | `/api/auth/me` | ✅ | Get user profile |
| POST | `/api/auth/internal/verify-token` | ❌ | Verify token validity |

### Protected Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/protected/profile` | ✅ | Get user profile |
| GET | `/api/protected/admin` | ✅ ADMIN | Admin dashboard |
| POST | `/api/protected/verify-token` | ✅ | Verify token is valid |
| GET | `/api/protected/health-auth` | ✅ | Authenticated health check |

### Public Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| GET | `/api/docs` | Swagger documentation |

---

## cURL Test Examples

### 1. Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Expected Response (201):
# {"id":"uuid","email":"john@example.com"}
```

### 2. Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Expected Response (200):
# {
#   "accessToken": "eyJhbGc...",
#   "user": {
#     "id": "uuid",
#     "email": "john@example.com",
#     "roles": ["USER"]
#   }
# }
```

### 3. Get User Profile (Protected)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <access_token>"

# Expected Response (200):
# {
#   "id": "uuid",
#   "name": "John Doe",
#   "email": "john@example.com",
#   "emailVerified": false,
#   "roles": ["USER"],
#   "createdAt": "2024-01-15T10:30:00Z",
#   "updatedAt": "2024-01-15T10:30:00Z"
# }
```

### 4. Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token_from_login>"
  }'

# Expected Response (200):
# {"accessToken": "eyJhbGc..."}
```

### 5. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token_from_login>"
  }'

# Expected Response (200):
# {"ok": true}
```

### 6. Forgot Password
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'

# Expected Response (200):
# {"ok": true}
# (Email sent if user exists)
```

### 7. Reset Password
```bash
# Get token from email, then:
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<token_from_email>",
    "newPassword": "NewSecurePass456!"
  }'

# Expected Response (200):
# {"ok": true}
```

### 8. Verify Email
```bash
# Get token from registration email, then:
curl -X GET "http://localhost:3000/api/auth/verify-email?token=<token_from_email>"

# Expected Response (200):
# {"ok": true}
```

### 9. Protected Route
```bash
curl -X GET http://localhost:3000/api/protected/profile \
  -H "Authorization: Bearer <access_token>"

# Expected Response (200):
# {
#   "message": "This is a protected route",
#   "user": {
#     "id": "uuid",
#     "roles": ["USER"]
#   },
#   "timestamp": "2024-01-15T10:30:00Z"
# }
```

### 10. Admin Route
```bash
# User must have ADMIN role:
curl -X GET http://localhost:3000/api/protected/admin \
  -H "Authorization: Bearer <access_token>"

# Expected Response (200) if ADMIN:
# {
#   "message": "Admin dashboard",
#   "user": {"id": "uuid", "roles": ["ADMIN"]},
#   "timestamp": "2024-01-15T10:30:00Z"
# }

# Expected Response (403) if not ADMIN:
# {"message": "Admin access required"}
```

---

## Postman Collection

### Import Template

Create a new Postman collection with these requests:

```json
{
  "info": {
    "name": "Auth Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": {"raw": "{{base_url}}/auth/register", "host": ["{{base_url}}"], "path": ["auth", "register"]},
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"TestPass123!\"\n}"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": {"raw": "{{base_url}}/auth/login", "host": ["{{base_url}}"], "path": ["auth", "login"]},
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"TestPass123!\"\n}"
        }
      }
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{access_token}}"}],
        "url": {"raw": "{{base_url}}/auth/me", "host": ["{{base_url}}"], "path": ["auth", "me"]}
      }
    },
    {
      "name": "Refresh Token",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": {"raw": "{{base_url}}/auth/refresh-token", "host": ["{{base_url}}"], "path": ["auth", "refresh-token"]},
        "body": {
          "mode": "raw",
          "raw": "{\n  \"refreshToken\": \"{{refresh_token}}\"\n}"
        }
      }
    },
    {
      "name": "Logout",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": {"raw": "{{base_url}}/auth/logout", "host": ["{{base_url}}"], "path": ["auth", "logout"]},
        "body": {"mode": "raw", "raw": "{}"}
      }
    }
  ],
  "variable": [
    {"key": "base_url", "value": "http://localhost:3000/api"},
    {"key": "access_token", "value": ""},
    {"key": "refresh_token", "value": ""}
  ]
}
```

### Usage Steps

1. Create new collection in Postman
2. Set `base_url` variable to `http://localhost:3000/api`
3. Use Register endpoint to create user
4. Use Login endpoint, copy `accessToken` to `access_token` variable
5. Use other endpoints with the token

---

## Test Scenarios

### Scenario 1: Happy Path - Complete Authentication Flow

**Objective:** Test complete user lifecycle

**Steps:**
```
1. Register new user
   POST /auth/register
   Expected: 201 Created
   
2. Login with credentials
   POST /auth/login
   Expected: 200 OK, receive accessToken
   
3. Access protected route
   GET /auth/me
   Authorization: Bearer {accessToken}
   Expected: 200 OK, user profile returned
   
4. Refresh token
   POST /auth/refresh-token
   Expected: 200 OK, new accessToken
   
5. Logout
   POST /auth/logout
   Expected: 200 OK
```

**Expected Outcomes:**
- ✅ User created successfully
- ✅ Access token obtained
- ✅ Profile accessible with valid token
- ✅ Token refreshed successfully
- ✅ Logout successful

---

### Scenario 2: Error Handling - Invalid Inputs

**Objective:** Test input validation

**Test Cases:**

1. **Missing Email**
```bash
POST /auth/register
{"name": "Test", "password": "Pass123!"}
Expected: 400 Bad Request
```

2. **Missing Password**
```bash
POST /auth/register
{"name": "Test", "email": "test@example.com"}
Expected: 400 Bad Request
```

3. **Weak Password**
```bash
POST /auth/register
{"name": "Test", "email": "test@example.com", "password": "weak"}
Expected: 400 Bad Request (password must be 8+ chars, contain uppercase, number)
```

4. **Invalid Email Format**
```bash
POST /auth/login
{"email": "invalid-email", "password": "Pass123!"}
Expected: 401 Unauthorized
```

**Expected Outcomes:**
- ✅ All validation errors caught
- ✅ Appropriate status codes returned
- ✅ Clear error messages provided

---

### Scenario 3: Authentication - Token Expiry

**Objective:** Test token expiry handling

**Steps:**
```
1. Login and get access token
   POST /auth/login
   Expected: 200 OK
   
2. Wait for token to expire (7 days in production, configurable in dev)
   
3. Attempt to use expired token
   GET /auth/me
   Authorization: Bearer {expiredToken}
   Expected: 401 Unauthorized, message: "Token expired"
   
4. Use refresh token to get new access token
   POST /auth/refresh-token
   Expected: 200 OK, new accessToken
   
5. Use new token on protected route
   GET /auth/me
   Authorization: Bearer {newAccessToken}
   Expected: 200 OK
```

**Expected Outcomes:**
- ✅ Expired tokens rejected
- ✅ Refresh token still valid
- ✅ New access token works

---

### Scenario 4: Security - Email Verification

**Objective:** Test email verification flow

**Steps:**
```
1. Register new user
   POST /auth/register
   Expected: 201 Created, email sent
   
2. Check user.emailVerified = false in database
   
3. Get verification token from email (or database in test)
   
4. Verify email with token
   GET /auth/verify-email?token={verificationToken}
   Expected: 200 OK
   
5. Check user.emailVerified = true in database
   
6. Try to verify again with same token
   GET /auth/verify-email?token={verificationToken}
   Expected: 400 Bad Request (already used)
```

**Expected Outcomes:**
- ✅ Email verification token generated
- ✅ Email verified successfully
- ✅ Token marked as used
- ✅ Cannot reuse token

---

### Scenario 5: Security - Password Reset

**Objective:** Test password reset flow

**Steps:**
```
1. Request password reset
   POST /auth/forgot-password
   {"email": "user@example.com"}
   Expected: 200 OK (even if user doesn't exist)
   
2. (If user exists) Check database for reset token
   
3. Reset password with token
   POST /auth/reset-password
   {"token": "{resetToken}", "newPassword": "NewPass456!"}
   Expected: 200 OK
   
4. Login with old password
   POST /auth/login
   {"email": "user@example.com", "password": "OldPass123!"}
   Expected: 401 Unauthorized
   
5. Login with new password
   POST /auth/login
   {"email": "user@example.com", "password": "NewPass456!"}
   Expected: 200 OK
```

**Expected Outcomes:**
- ✅ Reset token generated
- ✅ Password updated successfully
- ✅ Old password no longer works
- ✅ New password works

---

### Scenario 6: Authorization - Role-Based Access Control

**Objective:** Test RBAC enforcement

**Steps:**
```
1. Create regular USER
   Register and login
   Expected: access token obtained
   
2. Access admin endpoint
   GET /api/protected/admin
   Authorization: Bearer {userToken}
   Expected: 403 Forbidden
   
3. Create ADMIN user (update database directly for testing)
   
4. Login as admin
   Expected: access token obtained
   
5. Access admin endpoint
   GET /api/protected/admin
   Authorization: Bearer {adminToken}
   Expected: 200 OK
```

**Expected Outcomes:**
- ✅ Regular users blocked from admin endpoints
- ✅ Admin users can access admin endpoints
- ✅ RBAC enforced on each request

---

### Scenario 7: Security - Duplicate Prevention

**Objective:** Test duplicate email prevention

**Steps:**
```
1. Register user A
   POST /auth/register
   {"name": "User A", "email": "user@example.com", "password": "Pass123!"}
   Expected: 201 Created
   
2. Register user B with same email
   POST /auth/register
   {"name": "User B", "email": "user@example.com", "password": "Pass123!"}
   Expected: 409 Conflict or 400 Bad Request
   
3. Verify only one user in database
```

**Expected Outcomes:**
- ✅ First registration successful
- ✅ Duplicate registration rejected
- ✅ Only one user record in database

---

### Scenario 8: Security - No Email Leakage

**Objective:** Test forgot password security

**Steps:**
```
1. Request reset for existing email
   POST /auth/forgot-password
   {"email": "existing@example.com"}
   Expected: 200 OK
   Expected: Email sent
   
2. Request reset for non-existent email
   POST /auth/forgot-password
   {"email": "nonexistent@example.com"}
   Expected: 200 OK
   Expected: No email sent, same response
   
3. Compare response bodies
   Expected: Identical (no email leakage)
```

**Expected Outcomes:**
- ✅ Same response for existing and non-existent emails
- ✅ No indication whether email exists
- ✅ Security best practice implemented

---

### Scenario 9: Token Refresh - Rotation

**Objective:** Test token rotation mechanism

**Steps:**
```
1. Login and get tokens
   POST /auth/login
   Expected: accessToken, refreshToken
   Store as token1
   
2. Refresh token
   POST /auth/refresh-token
   {"refreshToken": token1}
   Expected: new accessToken, new refreshToken
   Store new as token2
   
3. Try to refresh with old refresh token (token1)
   POST /auth/refresh-token
   {"refreshToken": token1}
   Expected: 401 Unauthorized (old token replaced)
   
4. Use new refresh token (token2)
   POST /auth/refresh-token
   {"refreshToken": token2}
   Expected: 200 OK, another new refreshToken
```

**Expected Outcomes:**
- ✅ Old refresh token invalidated after rotation
- ✅ New token works
- ✅ Rotation prevents replay attacks

---

## Troubleshooting

### Issue: Cannot Connect to Database

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
1. Verify PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Verify credentials and port
4. Create database if needed

```bash
# Start PostgreSQL
sudo service postgresql start

# Test connection
psql -U postgres -d auth_service -c "SELECT 1"
```

---

### Issue: Prisma Client Not Found

**Symptoms:**
```
Error: Cannot find module '@prisma/client'
```

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Or reinstall
npm install
npx prisma generate
```

---

### Issue: Migration Errors

**Symptoms:**
```
Error: P3000 failed to create database
```

**Solution:**
```bash
# Reset migrations
npx prisma migrate reset

# Or create fresh
dropdb auth_service
createdb auth_service
npx prisma migrate dev --name init
```

---

### Issue: JWT Secret Not Set

**Symptoms:**
```
Error: JWT_ACCESS_SECRET is not defined
```

**Solution:**
1. Copy `.env.example` to `.env`
2. Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
3. Update `.env` with generated secrets

---

### Issue: Tests Failing

**Symptoms:**
```
FAIL: Tests timeout or fail
```

**Solution:**
```bash
# Ensure test database is clean
npx prisma migrate reset

# Run tests with verbose output
npm test -- --verbose

# Run single test file
npm test -- jwt-unit.test.ts
```

---

### Issue: Tokens Not Persisting in Cookie

**Symptoms:**
```
Refresh token not saved in cookie
```

**Solution:**
1. Verify HTTP-only cookie settings:
```bash
# Check response headers for Set-Cookie
curl -v http://localhost:3000/api/auth/login
```

2. Ensure CORS allows credentials:
```bash
# In app.ts, verify:
cors({ origin: process.env.FRONTEND_URL, credentials: true })
```

3. Client must send credentials in requests:
```bash
# Browser fetch example
fetch('/api/auth/refresh-token', {
  method: 'POST',
  credentials: 'include'  // Important!
})
```

---

### Issue: Slow Password Hashing

**Symptoms:**
```
Registration/login taking 1+ seconds
```

**Explanation:**
This is normal! Bcrypt intentionally uses computational cost to prevent brute force attacks.

**If too slow:**
```typescript
// In bcrypt.helper.ts, reduce salt rounds (not recommended):
const saltRounds = 8;  // Default is 10
```

---

### Issue: Email Not Sending

**Symptoms:**
```
Email service logs but no email received
```

**Solution:**
1. Check `SENDGRID_API_KEY` in `.env`:
```bash
# If not set, emails are logged only
echo "SENDGRID_API_KEY=" >> .env
```

2. Get SendGrid API key:
   - Create SendGrid account
   - Generate API key
   - Add to `.env`: `SENDGRID_API_KEY=sg_...`

3. Check email logs:
```bash
# Emails are logged when service is called
npm run dev > logs.txt 2>&1
```

---

### Issue: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE :::3000
```

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

## Performance Tips

### Development
```bash
# Use watch mode for auto-reload
npm run dev

# Monitor with nodemon
npm run dev -- --watch
```

### Production
```bash
# Build once
npm run build

# Start with clustering
npm start -- --cluster
```

### Database Optimization
```sql
-- Add indexes for faster queries
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_refresh_token_hash ON "RefreshToken"("tokenHash");
CREATE INDEX idx_email_token_hash ON "EmailToken"("tokenHash");
```

---

## Security Reminders

✅ Always use HTTPS in production  
✅ Keep JWT secrets secure and unique  
✅ Rotate refresh tokens on use  
✅ Hash all passwords with bcrypt  
✅ Set secure cookie flags  
✅ Validate all inputs  
✅ Use CORS with specific origins  
✅ Log authentication events  
✅ Monitor for suspicious activity  
✅ Keep dependencies updated  

---

## Resources

- **Express.js**: https://expressjs.com
- **JWT.io**: https://jwt.io
- **Bcrypt**: https://github.com/kelektiv/node.bcrypt.js
- **Prisma**: https://www.prisma.io
- **SendGrid**: https://sendgrid.com
- **PostgreSQL**: https://www.postgresql.org

