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
2. Set up SendGrid:
   - Create a SendGrid account at https://sendgrid.com
   - Generate an API key and add it to your `.env` file as `SENDGRID_API_KEY`
   - Verify your sender identity in SendGrid dashboard
   - Configure the `EMAIL_FROM` environment variable with your verified sender email
3. Install dependencies: `npm install`
4. Generate Prisma client: `npx prisma generate`
5. Run migrations: `npx prisma migrate dev --name init`
6. Start dev server: `npm run dev`
