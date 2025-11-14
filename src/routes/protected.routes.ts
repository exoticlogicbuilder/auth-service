import express from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import logger from "../utils/logger";

export const protectedRouter = express.Router();

// A simple protected route that returns user info
protectedRouter.get("/profile", requireAuth, (req: any, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Admin-only protected route
protectedRouter.get("/admin", requireAuth, (req: any, res) => {
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
protectedRouter.post("/verify-token", requireAuth, (req: any, res) => {
  res.json({
    message: "Token is valid",
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Health check that requires authentication
protectedRouter.get("/health-auth", requireAuth, (req: any, res) => {
  logger.info("Authenticated health check accessed", { userId: req.user.id });
  res.json({
    status: "healthy",
    authenticated: true,
    user: req.user.id
  });
});