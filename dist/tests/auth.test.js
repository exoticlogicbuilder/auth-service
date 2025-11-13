"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
beforeAll(async () => { });
afterAll(async () => {
    await prisma.$disconnect();
});
describe("Auth flow", () => {
    const email = `test+${Date.now()}@example.com`;
    const password = "P@ssw0rd!";
    it("registers a user", async () => {
        const res = await (0, supertest_1.default)(app_1.app).post("/api/auth/register").send({ name: "Test", email, password });
        expect(res.status).toBe(201);
        expect(res.body.email).toBe(email);
    });
    it("logins with correct credentials", async () => {
        const res = await (0, supertest_1.default)(app_1.app).post("/api/auth/login").send({ email, password });
        expect(res.status).toBe(200);
        expect(res.body.accessToken).toBeDefined();
    });
    it("rejects wrong password", async () => {
        const res = await (0, supertest_1.default)(app_1.app).post("/api/auth/login").send({ email, password: "wrong" });
        expect(res.status).toBe(401);
    });
});
