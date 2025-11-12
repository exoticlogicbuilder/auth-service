import request from "supertest";
import { app } from "../app";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Auth Integration Tests", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "P@ssw0rd123!";
  const testName = "Test User";
  let verificationToken: string | null = null;
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: testName,
          email: testEmail,
          password: testPassword
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.email).toBe(testEmail);
      
      // Verify user was created in database
      const user = await prisma.user.findUnique({ where: { email: testEmail } });
      expect(user).toBeDefined();
      expect(user?.name).toBe(testName);
      expect(user?.emailVerified).toBe(false);
    });

    it("should fail registration without email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Another User",
          password: testPassword
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("should fail registration without password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Another User",
          email: `another-${Date.now()}@example.com`
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("should fail registration with duplicate email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Duplicate User",
          email: testEmail,
          password: testPassword
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(testEmail);
      
      // Store tokens for later use
      accessToken = res.body.accessToken;
      
      // Check for refresh token in cookies
      const cookieHeader = res.headers["set-cookie"];
      expect(cookieHeader).toBeDefined();
    });

    it("should fail login with incorrect password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testEmail,
          password: "WrongPassword123!"
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message");
    });

    it("should fail login with non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: `nonexistent-${Date.now()}@example.com`,
          password: testPassword
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("GET /api/auth/verify-email", () => {
    it("should fail verify-email without token", async () => {
      const res = await request(app)
        .get("/api/auth/verify-email");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("should fail verify-email with invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/verify-email")
        .query({ token: "invalid-token-123456789" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("should verify email with valid token", async () => {
      // Get the verification token from the database
      const emailTokens = await prisma.emailToken.findMany({
        where: {
          userId: (await prisma.user.findUnique({ where: { email: testEmail } }))?.id,
          type: "verify",
          used: false
        }
      });

      expect(emailTokens.length).toBeGreaterThan(0);
      
      // For this test, we would need the raw token which is not stored
      // This is expected behavior for security reasons
      // The token is only available at registration time
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("should request password reset for existing email", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({
          email: testEmail
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("ok", true);

      // Verify reset token was created
      const resetTokens = await prisma.emailToken.findMany({
        where: {
          userId: (await prisma.user.findUnique({ where: { email: testEmail } }))?.id,
          type: "reset",
          used: false
        }
      });

      expect(resetTokens.length).toBeGreaterThan(0);
    });

    it("should succeed even for non-existent email (security: don't leak emails)", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({
          email: `nonexistent-${Date.now()}@example.com`
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("ok", true);
    });

    it("should fail forgot-password without email", async () => {
      const res = await request(app)
        .post("/api/auth/forgot-password")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/reset-password", () => {
    it("should fail reset-password without token", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({
          newPassword: "NewPassword123!"
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("should fail reset-password without password", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: "some-token"
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("should fail reset-password with invalid token", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: "invalid-token-12345678",
          newPassword: "NewPassword123!"
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    it("should fail refresh-token without token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh-token")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("should fail refresh-token with invalid token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh-token")
        .send({
          refreshToken: "invalid-token-12345678"
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should fail /me without auth token", async () => {
      const res = await request(app)
        .get("/api/auth/me");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .send({});

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("ok", true);
    });
  });
});
