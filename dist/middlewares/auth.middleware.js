"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const token_service_1 = require("../services/token.service");
const logger_1 = __importDefault(require("../utils/logger"));
const requireAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
        return res.status(401).json({ message: "Missing token" });
    const token = header.split(" ")[1];
    try {
        const payload = (0, token_service_1.verifyAccessToken)(token);
        req.user = { id: payload.userId, roles: payload.roles };
        next();
    }
    catch (err) {
        logger_1.default.warn("Auth middleware failed", { err });
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.requireAuth = requireAuth;
