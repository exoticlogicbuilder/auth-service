import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/token.service";
import logger from "../utils/logger";

export const requireAuth = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "Missing token" });
  const token = header.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: (payload as any).userId, roles: (payload as any).roles };
    next();
  } catch (err) {
    logger.warn("Auth middleware failed", { err });
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
