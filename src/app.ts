import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import "express-async-errors";
import { authRouter } from "./routes/auth.routes";
import { protectedRouter } from "./routes/protected.routes";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import logger from "./utils/logger";
import { errorHandler } from "./middlewares/error.middleware";

const swaggerDoc = YAML.load(__dirname + "/docs/openapi.yaml");

export const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL ?? true, credentials: true }));

app.use("/api/auth", authRouter);
app.use("/api/protected", protectedRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.get("/health", (_, res) => res.json({ ok: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// error handler
app.use(errorHandler);
