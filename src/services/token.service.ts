import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import logger from "../utils/logger";

const accessSecret: string = process.env.JWT_ACCESS_SECRET!;
const refreshSecret: string = process.env.JWT_REFRESH_SECRET!;
const accessExp: string = process.env.ACCESS_TOKEN_EXP ?? "15m";
const refreshExp: string = process.env.REFRESH_TOKEN_EXP ?? "7d";

export type AccessPayload = { userId: string; roles: string[]; jti?: string };

export const signAccessToken = (payload: AccessPayload) => {
  const jti = randomBytes(16).toString("hex");
  const token = jwt.sign({ ...payload, jti }, accessSecret, { expiresIn: accessExp });
  return { token, jti };
};

export const signRefreshToken = (userId: string) => {
  const jti = randomBytes(16).toString("hex");
  const token = jwt.sign({ sub: userId, jti }, refreshSecret, { expiresIn: refreshExp });
  return { token, jti };
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, accessSecret) as AccessPayload & { exp: number };
  } catch (err) {
    logger.warn("Access token verify failed", { err });
    throw err;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, refreshSecret) as { sub: string; jti: string; exp: number };
  } catch (err) {
    logger.warn("Refresh token verify failed", { err });
    throw err;
  }
};
