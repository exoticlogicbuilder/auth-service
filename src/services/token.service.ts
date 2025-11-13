import jwt, { SignOptions } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger";
import { StringValue } from "ms";

const accessSecret = process.env.JWT_ACCESS_SECRET!;
const refreshSecret = process.env.JWT_REFRESH_SECRET!;
const accessExp = (process.env.ACCESS_TOKEN_EXP ?? "15m") as StringValue;
const refreshExp = (process.env.REFRESH_TOKEN_EXP ?? "7d") as StringValue;

export type AccessPayload = { userId: string; roles: string[]; jti?: string };

export const signAccessToken = (payload: AccessPayload) => {
  const jti = uuidv4();
  const token = jwt.sign({ ...payload, jti }, accessSecret, { expiresIn: accessExp });
  return { token, jti };
};

export const signRefreshToken = (userId: string) => {
  const jti = uuidv4();
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
