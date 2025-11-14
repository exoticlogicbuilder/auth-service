"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("express-async-errors");
const auth_routes_1 = require("./routes/auth.routes");
const protected_routes_1 = require("./routes/protected.routes");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const logger_1 = __importDefault(require("./utils/logger"));
const error_middleware_1 = require("./middlewares/error.middleware");
const swaggerDoc = yamljs_1.default.load(__dirname + "/docs/openapi.yaml");
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL ?? true, credentials: true }));
exports.app.use("/api/auth", auth_routes_1.authRouter);
exports.app.use("/api/protected", protected_routes_1.protectedRouter);
exports.app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDoc));
exports.app.get("/health", (_, res) => res.json({ ok: true }));
exports.app.use((req, res, next) => {
    logger_1.default.info(`${req.method} ${req.path}`);
    next();
});
// error handler
exports.app.use(error_middleware_1.errorHandler);
