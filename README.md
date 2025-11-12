# Auth Service (Sprint 1 scaffold)

This scaffold contains a TypeScript + Express auth microservice implementing Sprint 1 features:
- Register (email verification token)
- Login (access + refresh tokens)
- Refresh token rotation
- Logout (revoke refresh token)
- Verify email, Forgot password, Reset password
- Password hashing with bcrypt
- RBAC (User/Admin/Reviewer)
- Prisma schema (Postgres)
- Swagger skeleton

Instructions:
1. Copy `.env.example` to `.env` and update variables.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Run migrations: `npx prisma migrate dev --name init`
5. Start dev server: `npm run dev`
