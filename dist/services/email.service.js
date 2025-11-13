"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordEmail = exports.sendVerificationEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const logger_1 = __importDefault(require("../utils/logger"));
// Initialize SendGrid
const sendGridApiKey = process.env.SENDGRID_API_KEY;
if (!sendGridApiKey) {
    logger_1.default.warn("SENDGRID_API_KEY environment variable is not set. Email sending will fail.");
}
mail_1.default.setApiKey(sendGridApiKey || "");
const sendVerificationEmail = async (to, token) => {
    if (!sendGridApiKey) {
        throw new Error("SendGrid API key is not configured");
    }
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const msg = {
        to: to,
        from: process.env.EMAIL_FROM || "no-reply@example.com",
        subject: "Verify your email address",
        html: `
      <h2>Welcome!</h2>
      <p>Thank you for registering. Please click the link below to verify your email address:</p>
      <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>Or copy and paste this link into your browser:</p>
      <p>${verificationLink}</p>
      <p>This link will expire in 24 hours.</p>
    `,
    };
    try {
        await mail_1.default.send(msg);
        logger_1.default.info(`Verification email sent successfully to ${to}`);
    }
    catch (error) {
        logger_1.default.error(`Failed to send verification email to ${to}:`, error);
        if (error.response) {
            logger_1.default.error('SendGrid API response:', error.response.body);
        }
        throw new Error('Failed to send verification email');
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendResetPasswordEmail = async (to, token) => {
    if (!sendGridApiKey) {
        throw new Error("SendGrid API key is not configured");
    }
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const msg = {
        to: to,
        from: process.env.EMAIL_FROM || "no-reply@example.com",
        subject: "Reset your password",
        html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>Or copy and paste this link into your browser:</p>
      <p>${resetLink}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
    `,
    };
    try {
        await mail_1.default.send(msg);
        logger_1.default.info(`Reset password email sent successfully to ${to}`);
    }
    catch (error) {
        logger_1.default.error(`Failed to send reset password email to ${to}:`, error);
        if (error.response) {
            logger_1.default.error('SendGrid API response:', error.response.body);
        }
        throw new Error('Failed to send reset password email');
    }
};
exports.sendResetPasswordEmail = sendResetPasswordEmail;
