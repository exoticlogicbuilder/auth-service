import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error("Unhandled error", { err: err?.message ?? err });
  const status = err?.status ?? 500;
  res.status(status).json({ message: err?.message ?? "Internal server error" });
};
