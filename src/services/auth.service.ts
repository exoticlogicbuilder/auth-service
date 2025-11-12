import { PrismaClient } from "@prisma/client";
import { hashPassword, hashToken, comparePassword, compareTokenHash } from "../utils/bcrypt.helper";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./token.service";
import { randomBytes } from "crypto";
import logger from "../utils/logger";

const prisma = new PrismaClient();

const EMAIL_TOKEN_EXP_HOURS = Number(process.env.EMAIL_TOKEN_EXP_HOURS ?? 24);

export const registerUser = async (name: string | undefined, email: string, password: string) => {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      roles: ["USER"]
    }
  });

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = await hashToken(rawToken);
  const expiresAt = new Date(Date.now() + EMAIL_TOKEN_EXP_HOURS * 60 * 60 * 1000);

  await prisma.emailToken.create({
    data: {
      tokenHash,
      userId: user.id,
      type: "verify",
      expiresAt
    }
  });

  return { user, verificationToken: rawToken };
};

export const createTokensForUser = async (userId: string, roles: string[]) => {
  const access = signAccessToken({ userId, roles });
  const refresh = signRefreshToken(userId);

  const tokenHash = await hashToken(refresh.token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const record = await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt
    }
  });

  return {
    accessToken: access.token,
    refreshToken: refresh.token,
    refreshTokenId: record.id
  };
};

export const rotateRefreshToken = async (oldTokenRaw: string) => {
  const payload = verifyRefreshToken(oldTokenRaw);
  const userId = payload.sub;
  const tokens = await prisma.refreshToken.findMany({ where: { userId, revoked: false } });
  for (const t of tokens) {
    if (await compareTokenHash(oldTokenRaw, t.tokenHash)) {
      await prisma.refreshToken.update({ where: { id: t.id }, data: { revoked: true } });
      const newRefresh = signRefreshToken(userId);
      const tokenHash = await hashToken(newRefresh.token);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const created = await prisma.refreshToken.create({
        data: { tokenHash, userId, expiresAt, replacedById: undefined }
      });
      return { access: signAccessToken({ userId, roles: (await getUserRoles(userId)) }).token, refresh: newRefresh.token };
    }
  }
  throw new Error("Refresh token not found / invalid");
};

export const revokeRefreshToken = async (raw: string) => {
  const payload = verifyRefreshToken(raw);
  const userId = payload.sub;
  const tokens = await prisma.refreshToken.findMany({ where: { userId, revoked: false } });
  for (const t of tokens) {
    if (await compareTokenHash(raw, t.tokenHash)) {
      await prisma.refreshToken.update({ where: { id: t.id }, data: { revoked: true } });
      return true;
    }
  }
  return false;
};

export const verifyEmailToken = async (rawToken: string) => {
  const tokens = await prisma.emailToken.findMany({ where: { type: "verify", used: false } });
  for (const t of tokens) {
    const match = await compareTokenHash(rawToken, t.tokenHash);
    if (match) {
      if (t.expiresAt < new Date()) throw new Error("Token expired");
      await prisma.user.update({ where: { id: t.userId }, data: { emailVerified: true } });
      await prisma.emailToken.update({ where: { id: t.id }, data: { used: true } });
      return true;
    }
  }
  return false;
};

export const createPasswordResetToken = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = await hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.emailToken.create({
    data: { tokenHash, userId: user.id, type: "reset", expiresAt }
  });
  return { user, resetToken: rawToken };
};

export const resetPasswordWithToken = async (rawToken: string, newPassword: string) => {
  const tokens = await prisma.emailToken.findMany({ where: { type: "reset", used: false } });
  for (const t of tokens) {
    if (await compareTokenHash(rawToken, t.tokenHash)) {
      if (t.expiresAt < new Date()) throw new Error("Token expired");
      const passwordHash = await hashPassword(newPassword);
      await prisma.user.update({ where: { id: t.userId }, data: { passwordHash } });
      await prisma.emailToken.update({ where: { id: t.id }, data: { used: true } });
      return true;
    }
  }
  return false;
};

export const validateUserCredentials = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return null;
  return user;
};

export const getUserRoles = async (userId: string) => {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  return u?.roles ?? [];
};

export const getUserProfile = async (userId: string) => {
  return prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, roles: true, emailVerified: true } });
};
