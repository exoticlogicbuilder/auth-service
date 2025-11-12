import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { sendVerificationEmail, sendResetPasswordEmail } from "../services/email.service";
import logger from "../utils/logger";
import { signAccessToken } from "../services/token.service";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "email and password required" });
  const { user, verificationToken } = await authService.registerUser(name, email, password);
  await sendVerificationEmail(email, verificationToken, name);
  res.status(201).json({ id: user.id, email: user.email });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.validateUserCredentials(email, password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const tokens = await authService.createTokensForUser(user.id, user.roles as any);
  res.cookie("refreshToken", tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ accessToken: tokens.accessToken, user: { id: user.id, email: user.email, roles: user.roles } });
};

export const refreshToken = async (req: Request, res: Response) => {
  const incoming = req.body?.refreshToken ?? req.cookies?.refreshToken;
  if (!incoming) return res.status(400).json({ message: "Missing refresh token" });
  try {
    const rotated = await authService.rotateRefreshToken(incoming);
    res.cookie("refreshToken", rotated.refresh, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken: rotated.access });
  } catch (err: any) {
    logger.warn("Refresh token failed", { err: err?.message ?? err });
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const incoming = req.body?.refreshToken ?? req.cookies?.refreshToken;
  if (incoming) {
    await authService.revokeRefreshToken(incoming);
  }
  res.clearCookie("refreshToken");
  res.json({ ok: true });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const token = req.query.token as string;
  if (!token) return res.status(400).json({ message: "Missing token" });
  try {
    await authService.verifyEmailToken(token);
    res.json({ ok: true });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Invalid token" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Missing email" });
  const result = await authService.createPasswordResetToken(email);
  if (!result) return res.json({ ok: true });
  await sendResetPasswordEmail(email, result.resetToken, result.user.name || undefined);
  res.json({ ok: true });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: "Missing token or password" });
  try {
    await authService.resetPasswordWithToken(token, newPassword);
    res.json({ ok: true });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message ?? "Invalid token" });
  }
};

export const me = async (req: Request & { user?: any }, res: Response) => {
  const user = await authService.getUserProfile(req.user.id);
  res.json(user);
};

export const internalVerifyToken = async (req: Request, res: Response) => {
  const token = req.body?.token;
  if (!token) return res.status(400).json({ message: "Missing token" });
  try {
    res.json({ ok: true, message: "Internal verify endpoint - implement verifyAccessToken for production" });
  } catch (err) {
    res.status(401).json({ ok: false });
  }
};
