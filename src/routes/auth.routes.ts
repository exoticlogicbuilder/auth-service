import express from "express";
import * as controller from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const authRouter = express.Router();

authRouter.post("/register", controller.register);
authRouter.post("/login", controller.login);
authRouter.post("/refresh-token", controller.refreshToken);
authRouter.post("/logout", controller.logout);

authRouter.get("/verify-email", controller.verifyEmail);
authRouter.post("/forgot-password", controller.forgotPassword);
authRouter.post("/reset-password", controller.resetPassword);

authRouter.get("/me", requireAuth, controller.me);

authRouter.post("/internal/verify-token", controller.internalVerifyToken);
