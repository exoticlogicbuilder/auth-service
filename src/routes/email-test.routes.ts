import express from "express";
import * as controller from "../controllers/email-test.controller";

export const emailTestRouter = express.Router();

// Only allow these routes in development environment
emailTestRouter.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: "Not found" });
  }
  next();
});

emailTestRouter.get("/config", controller.testEmailConfig);
emailTestRouter.post("/send-test", controller.sendTestEmail);