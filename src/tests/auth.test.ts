import request from "supertest";
import { app } from "../app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Auth flow", () => {
  const email = `test+${Date.now()}@example.com`;
  const password = "P@ssw0rd!";

  it("registers a user", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Test", email, password });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
    expect(res.body.accessToken).toBeDefined();
  });

  it("rejects duplicate email registration", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Test", email, password });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Email already registered");
  });

  it("rejects password without uppercase", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Test", email: `test2+${Date.now()}@example.com`, password: "password123" });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("uppercase");
  });

  it("rejects password without number", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Test", email: `test3+${Date.now()}@example.com`, password: "Password" });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("number");
  });

  it("rejects password shorter than 8 chars", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Test", email: `test4+${Date.now()}@example.com`, password: "Pass1" });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("8 characters");
  });

  it("rejects registration without name", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: `test5+${Date.now()}@example.com`, password });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Name is required");
  });

  it("logins with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it("rejects wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email, password: "wrong" });
    expect(res.status).toBe(401);
  });
});
