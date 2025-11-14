# Auth Service with JWT Authentication

This service provides a complete JWT authentication system with secure session management and 7-day token expiry.

## Features

- ✅ **JWT tokens with 7-day expiry**
- ✅ **Secure token verification middleware**
- ✅ **User data extraction from tokens**
- ✅ **Secure token storage (httpOnly cookies + localStorage)**
- ✅ **Graceful expired token handling**
- ✅ **Token refresh mechanism**
- ✅ **Role-based access control (RBAC)**
- ✅ **Email verification**
- ✅ **Password reset functionality**
- ✅ **Comprehensive error handling**

## Quick Start

1. **Copy environment configuration:**
   ```bash
   cp .env.example .env
   # Update .env with your secure JWT secrets
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Documentation

For detailed JWT implementation documentation, including:
- API endpoint documentation
- Client-side integration examples
- Security considerations
- Testing procedures

👉 **See [JWT_AUTH_README.md](./JWT_AUTH_README.md)**

## Testing

Run the comprehensive test suite:
```bash
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get user profile

### Protected Routes
- `GET /api/protected/profile` - User profile (requires auth)
- `GET /api/protected/admin` - Admin dashboard (requires ADMIN role)
- `GET /api/protected/health-auth` - Authenticated health check

## Technology Stack

- **Backend**: Node.js, Express, TypeScript
- **Authentication**: JWT (jsonwebtoken)
- **Database**: PostgreSQL with Prisma ORM
- **Security**: bcrypt, helmet, CORS
- **Testing**: Jest, Supertest
