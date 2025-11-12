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
    expect(res.body.email).toBe(email);
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
