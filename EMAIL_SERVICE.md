# SendGrid SMTP Email Service

This authentication service now includes SendGrid SMTP relay functionality for sending verification and password reset emails.

## Configuration

Add the following environment variables to your `.env` file:

```env
# SendGrid SMTP Configuration
SENDGRID_SMTP_HOST=smtp.sendgrid.net
SENDGRID_SMTP_PORT=587
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_USERNAME=apikey
SENDGRID_PASSWORD=your_sendgrid_api_key_here

# Email Configuration
EMAIL_FROM=your-verified-sender@example.com
FRONTEND_URL=https://your-frontend-domain.com
```

## SendGrid Setup

1. **Create a SendGrid Account**
   - Sign up at [SendGrid](https://sendgrid.com/)
   - Verify your sender identity

2. **Generate API Key**
   - Go to Settings > API Keys in your SendGrid dashboard
   - Create a new API key with "Mail Send" permissions
   - Copy the API key and add it to your environment variables

3. **Verify Sender Identity**
   - Go to Settings > Sender Authentication
   - Either authenticate a domain or single sender
   - The email address in `EMAIL_FROM` must be a verified sender

4. **Update Environment Variables**
   - Replace `your_sendgrid_api_key_here` with your actual API key
   - Update `EMAIL_FROM` to use your verified sender email
   - Set `FRONTEND_URL` to your actual frontend domain

## Features

### Email Templates

The service includes responsive HTML email templates for:

- **Email Verification**: Professional verification emails with clear call-to-action buttons
- **Password Reset**: Secure password reset emails with security warnings

### Error Handling

- Comprehensive error logging for debugging
- Configuration validation on startup
- SMTP connection verification
- Graceful fallback with detailed error messages

### Development Testing

In development mode, you can test the email service using these endpoints:

- `GET /api/email-test/config` - Test email configuration and SMTP connection
- `POST /api/email-test/send-test` - Send a test verification email

Example test request:
```bash
curl -X POST http://localhost:4000/api/email-test/send-test \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@example.com"}'
```

## Security Considerations

1. **API Key Security**
   - Never commit your SendGrid API key to version control
   - Use environment variables or a secure secret management system
   - Rotate API keys regularly

2. **Sender Authentication**
   - Always use authenticated senders in SendGrid
   - Domain authentication is preferred over single sender verification

3. **Rate Limiting**
   - SendGrid has rate limits based on your plan
   - Monitor your email sending volume
   - Implement appropriate rate limiting in your application

## Email Sending Flow

1. **User Registration**
   - User registers with email and password
   - System generates verification token
   - Email sent with verification link
   - User clicks link to verify email

2. **Password Reset**
   - User requests password reset
   - System generates reset token
   - Email sent with reset link
   - User clicks link to reset password

## Monitoring and Logging

All email activities are logged with:
- Success/failure status
- Message IDs from SendGrid
- Error details for troubleshooting
- Configuration validation warnings

## Troubleshooting

### Common Issues

1. **"Missing required configuration" error**
   - Check that all required environment variables are set
   - Verify your `.env` file is being loaded correctly

2. **SMTP connection failed**
   - Verify your SendGrid API key is valid
   - Check that your sender is authenticated
   - Ensure you're using the correct SMTP settings

3. **Emails not being delivered**
   - Check SendGrid dashboard for delivery reports
   - Verify sender email is authenticated
   - Check spam filters and email reputation

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

This will provide detailed information about:
- SMTP connection attempts
- Email sending process
- Configuration validation results