// Test setup file
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client for testing
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    emailToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.ACCESS_TOKEN_EXP = '7d';
process.env.REFRESH_TOKEN_EXP = '7d';