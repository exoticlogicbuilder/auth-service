"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const logger_1 = __importDefault(require("../utils/logger"));
const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const accessExp = process.env.ACCESS_TOKEN_EXP ?? "15m";
const refreshExp = process.env.REFRESH_TOKEN_EXP ?? "7d";
const signAccessToken = (payload) => {
    const jti = (0, uuid_1.v4)();
    const token = jsonwebtoken_1.default.sign({ ...payload, jti }, accessSecret, {
        expiresIn: accessExp,
        algorithm: 'HS256'
    });
    return { token, jti };
};
exports.signAccessToken = signAccessToken;
const signRefreshToken = (userId) => {
    const jti = (0, uuid_1.v4)();
    const token = jsonwebtoken_1.default.sign({ sub: userId, jti }, refreshSecret, {
        expiresIn: refreshExp,
        algorithm: 'HS256'
    });
    return { token, jti };
};
exports.signRefreshToken = signRefreshToken;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, accessSecret);
    }
    catch (err) {
        logger_1.default.warn("Access token verify failed", { err });
        throw err;
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, refreshSecret);
    }
    catch (err) {
        logger_1.default.warn("Refresh token verify failed", { err });
        throw err;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
