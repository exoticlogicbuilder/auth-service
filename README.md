# Auth Service

This is a TypeScript + Express authentication microservice with comprehensive email verification functionality using SendGrid SMTP relay.

## Features

### Authentication
- User registration with email verification
- Login with JWT access and refresh tokens
- Refresh token rotation for enhanced security
- Logout with token revocation
- Password hashing with bcrypt

### Email Services
- **SendGrid SMTP Integration**: Real email sending using SendGrid's SMTP relay
- **Email Verification**: Professional HTML email templates for user verification
- **Password Reset**: Secure password reset emails with security warnings
- **Configuration Validation**: Automatic validation of email settings on startup

### Authorization & Security
- Role-based access control (User/Admin/Reviewer)
- JWT token management
- Secure cookie handling
- Environment-based configuration

### Development Tools
- Prisma ORM with PostgreSQL
- Swagger API documentation
- Comprehensive logging with Winston
- Email testing endpoints for development

## Quick Start

1. **Environment Setup**
   ```bash
   cp .env.example .env
   # Update .env with your configuration including SendGrid settings
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## SendGrid Email Configuration

### Required Environment Variables

```env
# SendGrid SMTP Configuration
SENDGRID_SMTP_HOST=smtp.sendgrid.net
SENDGRID_SMTP_PORT=587
SENDGRID_API_KEY=your_actual_sendgrid_api_key
SENDGRID_USERNAME=apikey
SENDGRID_PASSWORD=your_actual_sendgrid_api_key

# Email Configuration
EMAIL_FROM=your-verified-sender@example.com
FRONTEND_URL=https://your-frontend-domain.com
```

### SendGrid Setup Instructions

1. **Create SendGrid Account**
   - Sign up at [SendGrid](https://sendgrid.com/)
   - Complete the sender verification process

2. **Generate API Key**
   - Navigate to Settings > API Keys
   - Create a new API key with "Mail Send" permissions
   - Copy the API key to your `.env` file

3. **Authenticate Sender**
   - Go to Settings > Sender Authentication
   - Either authenticate your domain or verify a single sender
   - The `EMAIL_FROM` address must match your verified sender

4. **Test Configuration**
   ```bash
   # Test email configuration
   npm run test-email
   
   # Send a test email (requires TEST_EMAIL environment variable)
   TEST_EMAIL=your-email@example.com npm run test-email
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Email Verification
- `GET /api/auth/verify-email?token=xxx` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Development Testing (Development Only)
- `GET /api/email-test/config` - Test email configuration
- `POST /api/email-test/send-test` - Send test verification email

## Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run test-email` - Test email configuration

### Database
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:generate` - Generate Prisma client

### API Documentation
- Swagger UI available at `/api/docs` when running the server

## Security Considerations

- Never commit API keys or secrets to version control
- Use environment variables for all sensitive configuration
- Enable HTTPS in production
- Regularly rotate JWT secrets and API keys
- Monitor email sending rates and SendGrid usage

## Troubleshooting

### Email Issues
1. Check SendGrid dashboard for delivery reports
2. Verify sender authentication is complete
3. Ensure API key has "Mail Send" permissions
4. Check environment variables are correctly set

### Common Errors
- "Missing required configuration" - Check all required environment variables
- "SMTP connection failed" - Verify API key and sender authentication
- "Emails not delivered" - Check spam filters and sender reputation

For detailed email service documentation, see [EMAIL_SERVICE.md](./EMAIL_SERVICE.md).
