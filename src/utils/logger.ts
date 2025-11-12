import winston from "winston";

const level = process.env.LOG_LEVEL ?? "info";

const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

export default logger;
