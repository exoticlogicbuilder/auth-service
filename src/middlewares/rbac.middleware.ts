import { Request, Response, NextFunction } from "express";

export const requireRole = (role: string) => {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    const userRoles: string[] = req.user?.roles ?? [];
    if (userRoles.includes(role)) return next();
    return res.status(403).json({ message: "Forbidden" });
  };
};
