import { signAccessToken, verifyAccessToken } from '../services/token.service';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middlewares/auth.middleware';
import { Request, Response, NextFunction } from 'express';

const testPayload = { userId: 'test-user-123', roles: ['USER'] };

describe('JWT Token Service', () => {

  describe('Token Generation', () => {
    it('should generate access token with 7-day expiry', () => {
      const { token } = signAccessToken(testPayload);
      expect(token).toBeDefined();
      
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.roles).toEqual(testPayload.roles);
      expect(decoded.jti).toBeDefined();
      
      const expiryDuration = decoded.exp - decoded.iat;
      expect(expiryDuration).toBe(7 * 24 * 60 * 60); // 7 days in seconds
    });

    it('should generate unique JTI for each token', () => {
      const { token: token1 } = signAccessToken(testPayload);
      const { token: token2 } = signAccessToken(testPayload);
      
      const decoded1 = jwt.decode(token1) as any;
      const decoded2 = jwt.decode(token2) as any;
      
      expect(decoded1.jti).not.toBe(decoded2.jti);
    });
  });

  describe('Token Verification', () => {
    it('should verify valid token', () => {
      const { token } = signAccessToken(testPayload);
      const payload = verifyAccessToken(token);
      
      expect(payload.userId).toBe(testPayload.userId);
      expect(payload.roles).toEqual(testPayload.roles);
      expect(payload.jti).toBeDefined();
      expect(payload.exp).toBeDefined();
    });

    it('should throw error for expired token', () => {
      const expiredToken = jwt.sign(
        testPayload,
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );
      
      expect(() => verifyAccessToken(expiredToken)).toThrow();
    });

    it('should throw error for invalid token', () => {
      const invalidToken = jwt.sign(
        testPayload,
        'wrong-secret',
        { expiresIn: '7d' }
      );
      
      expect(() => verifyAccessToken(invalidToken)).toThrow();
    });
  });
});

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request & { user?: any }>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  it('should pass with valid Bearer token', () => {
    const { token } = signAccessToken(testPayload);
    mockRequest.headers = { authorization: `Bearer ${token}` };
    
    requireAuth(mockRequest as Request & { user?: any }, mockResponse as Response, nextFunction);
    
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toEqual({
      id: testPayload.userId,
      roles: testPayload.roles,
      jti: expect.any(String)
    });
  });

  it('should reject missing authorization header', () => {
    requireAuth(mockRequest as Request & { user?: any }, mockResponse as Response, nextFunction);
    
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ 
      message: "Missing or malformed authorization header" 
    });
  });

  it('should reject malformed authorization header', () => {
    mockRequest.headers = { authorization: 'InvalidFormat' };
    
    requireAuth(mockRequest as Request & { user?: any }, mockResponse as Response, nextFunction);
    
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ 
      message: "Missing or malformed authorization header" 
    });
  });

  it('should reject missing token', () => {
    mockRequest.headers = { authorization: 'Bearer ' };
    
    requireAuth(mockRequest as Request & { user?: any }, mockResponse as Response, nextFunction);
    
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ 
      message: "Missing token" 
    });
  });

  it('should reject expired token', () => {
    const expiredToken = jwt.sign(
      testPayload,
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '-1h' }
    );
    mockRequest.headers = { authorization: `Bearer ${expiredToken}` };
    
    requireAuth(mockRequest as Request & { user?: any }, mockResponse as Response, nextFunction);
    
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ 
      message: "Token expired" 
    });
  });

  it('should reject invalid token', () => {
    const invalidToken = jwt.sign(
      testPayload,
      'wrong-secret',
      { expiresIn: '7d' }
    );
    mockRequest.headers = { authorization: `Bearer ${invalidToken}` };
    
    requireAuth(mockRequest as Request & { user?: any }, mockResponse as Response, nextFunction);
    
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ 
      message: "Invalid token" 
    });
  });
});