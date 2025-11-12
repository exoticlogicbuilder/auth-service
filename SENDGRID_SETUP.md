# SendGrid Email Verification Service Setup

## Overview
This project uses SendGrid API for sending email verification and password reset emails.

## Setup Instructions

### 1. Install Dependencies
The required dependency is already added to `package.json`:
```bash
npm install
```

### 2. Configure SendGrid API Key
1. Go to [SendGrid](https://sendgrid.com)
2. Sign up or log in to your account
3. Create an API key in Settings → API Keys
4. Copy the API key

### 3. Update Environment Variables
Create a `.env` file based on `.env.example` and add:
```env
SENDGRID_API_KEY=your_actual_sendgrid_api_key_here
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=http://localhost:3000
```

### 4. Development Mode
If `SENDGRID_API_KEY` is not set, the service will log emails to the console instead of sending them. This is useful for development.

## Email Templates

The service provides two email templates:

### Verification Email
- **When sent**: After user registration
- **Expires**: 24 hours
- **Contains**: 
  - Personalized greeting with user's name
  - Verification link
  - Fallback link text
  - Expiration notice

### Reset Password Email
- **When sent**: After forgot password request
- **Expires**: 1 hour
- **Contains**:
  - Personalized greeting with user's name
  - Reset link
  - Fallback link text
  - Expiration notice
  - Security reassurance message

## API Integration

### sendVerificationEmail(to, token, name?)
Sends verification email to user after registration.

**Parameters:**
- `to` (string): Recipient email address
- `token` (string): Verification token generated during registration
- `name` (string, optional): User's name for personalization

**Example:**
```typescript
await sendVerificationEmail(
  "user@example.com",
  "verification_token_here",
  "John Doe"
);
```

### sendResetPasswordEmail(to, token, name?)
Sends password reset email when user requests password recovery.

**Parameters:**
- `to` (string): Recipient email address
- `token` (string): Reset token generated during password reset request
- `name` (string, optional): User's name for personalization

**Example:**
```typescript
await sendResetPasswordEmail(
  "user@example.com",
  "reset_token_here",
  "John Doe"
);
```

## Error Handling

The email service includes comprehensive error handling:

1. **Missing API Key**: Logs warning and switches to development mode
2. **SendGrid API Failures**: Logs error and throws descriptive error message
3. **Missing Configuration**: Validates EMAIL_FROM and FRONTEND_URL before sending

## Features

✅ **HTML and Plain Text Emails**: Both formats for maximum compatibility
✅ **Responsive Design**: Mobile-friendly email templates
✅ **Personalization**: User names included in email greeting
✅ **Development Mode**: Console logging when API key is not set
✅ **Error Handling**: Comprehensive error messages and logging
✅ **Security**: Uses environment variables for sensitive data
✅ **Logging**: Winston logger integration for monitoring

## Testing

Run the email service tests:
```bash
npm test -- src/tests/email.test.ts
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| SENDGRID_API_KEY | No | SendGrid API key for production sending |
| EMAIL_FROM | Yes | From address for emails (must be verified in SendGrid) |
| FRONTEND_URL | Yes | Base URL for verification/reset links |
| LOG_LEVEL | No | Winston log level (default: info) |

## Troubleshooting

### Emails not sending in production
- Verify SENDGRID_API_KEY is set correctly
- Check that EMAIL_FROM address is verified in SendGrid dashboard
- Review logs for specific error messages

### Verification links not working
- Ensure FRONTEND_URL matches your frontend domain
- Check that token is correctly passed in URL query parameter
- Verify token hasn't expired (24 hours for verification)

### Development mode emails not showing
- Set LOG_LEVEL=debug in .env for more verbose output
- Check console output for [DEV MODE] messages
- Ensure Winston logger is configured properly

## Production Considerations

1. **Sender Address**: Register your domain with SendGrid and use authenticated sender addresses
2. **Email Deliverability**: Monitor SendGrid dashboard for bounce rates
3. **Rate Limiting**: SendGrid has rate limits based on your plan
4. **Compliance**: Ensure emails comply with CAN-SPAM and GDPR requirements
5. **Monitoring**: Set up alerts for failed email sends

## Related Files

- `/src/services/email.service.ts` - Main email service implementation
- `/src/controllers/auth.controller.ts` - Auth controller using email service
- `/.env.example` - Environment configuration template
- `/package.json` - Dependencies
