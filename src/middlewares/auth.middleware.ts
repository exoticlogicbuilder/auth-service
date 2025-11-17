import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/token.service";
import logger from "../utils/logger";
import jwt from "jsonwebtoken";

export const requireAuth = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or malformed authorization header" });
  }
  
  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { 
      id: (payload as any).userId, 
      roles: (payload as any).roles,
      jti: (payload as any).jti
    };
    next();
  } catch (err) {
    logger.warn("Auth middleware failed", { err });
    
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    } else if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      return res.status(401).json({ message: "Token verification failed" });
    }
  }
};