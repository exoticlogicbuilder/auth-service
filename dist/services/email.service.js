"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.sendResetPasswordEmail = exports.sendVerificationEmail = void 0;
const smtp_email_service_1 = __importDefault(require("./smtp-email.service"));
exports.emailService = smtp_email_service_1.default;
const logger_1 = __importDefault(require("../utils/logger"));
const sendVerificationEmail = async (to, token) => {
    try {
        await smtp_email_service_1.default.sendVerificationEmail(to, token);
        logger_1.default.info(`Verification email sent successfully to ${to}`);
    }
    catch (error) {
        logger_1.default.error(`Failed to send verification email to ${to}:`, error);
        throw error;
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendResetPasswordEmail = async (to, token) => {
    try {
        await smtp_email_service_1.default.sendResetPasswordEmail(to, token);
        logger_1.default.info(`Password reset email sent successfully to ${to}`);
    }
    catch (error) {
        logger_1.default.error(`Failed to send password reset email to ${to}:`, error);
        throw error;
    }
};
exports.sendResetPasswordEmail = sendResetPasswordEmail;
