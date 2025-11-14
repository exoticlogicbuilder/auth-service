# JWT Authentication Middleware with 7-Day Session Management

This implementation provides a complete JWT authentication system with secure session management, featuring 7-day token expiry and comprehensive middleware protection.

## Features

- ✅ **JWT tokens with 7-day expiry**
- ✅ **Secure token verification middleware**
- ✅ **User data extraction from tokens**
- ✅ **Secure token storage (httpOnly cookies + localStorage)**
- ✅ **Graceful expired token handling**
- ✅ **Token refresh mechanism**
- ✅ **Role-based access control**
- ✅ **Comprehensive error handling**

## Architecture Overview

### Token Types

1. **Access Token**: 7-day expiry, stored in client-side localStorage
2. **Refresh Token**: 7-day expiry, stored in httpOnly cookies

### Security Features

- JWT signature verification
- Token expiration checking
- Secure httpOnly cookie storage for refresh tokens
- Token rotation on refresh
- Database-stored hashed refresh tokens
- Comprehensive error handling for different token states

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/register` | User registration | None |
| POST | `/login` | User login | None |
| POST | `/refresh-token` | Refresh access token | Refresh token |
| POST | `/logout` | User logout | Refresh token |
| GET | `/me` | Get user profile | Access token |
| POST | `/internal/verify-token` | Verify token validity | None |
| GET | `/verify-email` | Verify email | Token |
| POST | `/forgot-password` | Request password reset | None |
| POST | `/reset-password` | Reset password | Token |

### Protected Routes (`/api/protected`)

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Any authenticated user |
| GET | `/admin` | Admin dashboard | ADMIN |
| POST | `/verify-token` | Verify current token | Any authenticated user |
| GET | `/health-auth` | Authenticated health check | Any authenticated user |

## Environment Configuration

Create a `.env` file with the following configuration:

```env
# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/authdb

# JWT Configuration
JWT_ACCESS_SECRET=your_super_secure_access_secret_key_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here
ACCESS_TOKEN_EXP=7d
REFRESH_TOKEN_EXP=7d

# Security
BCRYPT_SALT_ROUNDS=12

# Email (Optional)
EMAIL_TOKEN_EXP_HOURS=24
EMAIL_FROM=no-reply@example.com

# Logging
LOG_LEVEL=debug
```

## Usage Examples

### 1. User Registration

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

### 2. User Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_here",
    "email": "john@example.com",
    "roles": ["USER"]
  }
}
```

### 3. Access Protected Route

```bash
curl -X GET http://localhost:4000/api/protected/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 4. Token Verification

```bash
curl -X POST http://localhost:4000/api/auth/internal/verify-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_ACCESS_TOKEN_HERE"
  }'
```

## Client-Side Integration

### JavaScript/TypeScript Example

```javascript
// Login and store token
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });
  
  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data;
}

// Make authenticated request
async function getProfile() {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('/api/protected/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 401) {
    // Handle expired token
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  }
  
  return response.json();
}
```

See `src/client/token-storage-example.ts` for a complete client-side implementation.

## Token Expiry Handling

The system provides different error messages for various token states:

- **Missing token**: "Missing or malformed authorization header"
- **Expired token**: "Token expired"
- **Invalid token**: "Invalid token"
- **General error**: "Token verification failed"

## Middleware Implementation

### Basic Usage

```typescript
import { requireAuth } from './middlewares/auth.middleware';

// Apply to single route
router.get('/protected', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Apply to multiple routes
router.use('/admin', requireAuth);
```

### Advanced Usage with Role-Based Access

```typescript
router.get('/admin', requireAuth, (req, res) => {
  if (!req.user.roles.includes('ADMIN')) {
    return res.status(403).json({ message: "Admin access required" });
  }
  // Admin logic here
});
```

## Security Considerations

1. **JWT Secrets**: Use strong, unique secrets for production
2. **HTTPS**: Always use HTTPS in production to prevent token interception
3. **Token Storage**: Consider security vs convenience trade-offs:
   - httpOnly cookies: More secure, less convenient
   - localStorage: More convenient, slightly less secure
   - sessionStorage: Good balance for sensitive applications
4. **Token Rotation**: Refresh tokens are automatically rotated on use
5. **Password Security**: Uses bcrypt with configurable salt rounds

## Testing

Run the comprehensive test suite:

```bash
npm test
```

Test coverage includes:
- Token generation and verification
- Middleware behavior with valid/invalid tokens
- Protected route access
- Token expiry handling
- Error scenarios

## Database Schema

The implementation uses the following database tables:
- `users`: User accounts with roles
- `refreshTokens`: Hashed refresh tokens for security
- `emailTokens`: Email verification and password reset tokens

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## Production Deployment Checklist

- [ ] Set strong JWT secrets in environment variables
- [ ] Configure HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure secure httpOnly cookie settings
- [ ] Set up proper database connection
- [ ] Configure CORS for your frontend domain
- [ ] Set up logging and monitoring
- [ ] Configure rate limiting
- [ ] Set up database backups

## License

This implementation follows security best practices and is ready for production use with proper configuration.