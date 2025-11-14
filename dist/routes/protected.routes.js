"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const logger_1 = __importDefault(require("../utils/logger"));
exports.protectedRouter = express_1.default.Router();
// A simple protected route that returns user info
exports.protectedRouter.get("/profile", auth_middleware_1.requireAuth, (req, res) => {
    res.json({
        message: "This is a protected route",
        user: req.user,
        timestamp: new Date().toISOString()
    });
});
// Admin-only protected route
exports.protectedRouter.get("/admin", auth_middleware_1.requireAuth, (req, res) => {
    if (!req.user.roles.includes('ADMIN')) {
        return res.status(403).json({ message: "Admin access required" });
    }
    res.json({
        message: "Admin dashboard",
        user: req.user,
        timestamp: new Date().toISOString()
    });
});
// Test route to verify token expiry
exports.protectedRouter.post("/verify-token", auth_middleware_1.requireAuth, (req, res) => {
    res.json({
        message: "Token is valid",
        user: req.user,
        timestamp: new Date().toISOString()
    });
});
// Health check that requires authentication
exports.protectedRouter.get("/health-auth", auth_middleware_1.requireAuth, (req, res) => {
    logger_1.default.info("Authenticated health check accessed", { userId: req.user.id });
    res.json({
        status: "healthy",
        authenticated: true,
        user: req.user.id
    });
});
