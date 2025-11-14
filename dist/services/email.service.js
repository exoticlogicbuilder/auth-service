"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordEmail = exports.sendVerificationEmail = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const sendVerificationEmail = async (to, token) => {
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    logger_1.default.info(`Send verification email to ${to} with link ${link}`);
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendResetPasswordEmail = async (to, token) => {
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    logger_1.default.info(`Send reset password email to ${to} with link ${link}`);
};
exports.sendResetPasswordEmail = sendResetPasswordEmail;
