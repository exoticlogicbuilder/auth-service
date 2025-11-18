# Auth Service

This is a TypeScript + Express auth microservice with comprehensive authentication features:

## Features
- **User Registration** with email verification (password validation, bcrypt hashing)
- **Login** with JWT access + refresh tokens
- **Token Refresh & Rotation** (7-day expiry, token reuse prevention)
- **Logout** (refresh token revocation)
- **Email Verification** (token-based, one-time use)
- **Password Reset Flow** (forgot password, reset with token)
- **RBAC** (Role-Based Access Control: User/Admin/Reviewer)
- **Protected Routes** with JWT middleware
- **Input Validation** (Zod schemas)
- **Prisma ORM** (PostgreSQL)
- **Swagger/OpenAPI** documentation
- **Logger-based Email Service** (no external email provider required)

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update .env with your database URL and JWT secrets:**
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/authdb
   JWT_ACCESS_SECRET=your_secure_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

5. **Run database migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

The service will start on port 4000 (configurable via PORT in .env).

## API Documentation

- Swagger UI: `http://localhost:4000/api/docs`
- Health check: `http://localhost:4000/health`

## Testing

Run tests with:
```bash
npm test
```

For more detailed documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md).
