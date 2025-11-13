"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestEmail = exports.testEmailConfig = void 0;
const email_service_1 = require("../services/email.service");
const email_config_1 = require("../utils/email-config");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Test endpoint to verify email configuration
 * This should only be available in development environment
 */
const testEmailConfig = async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ message: "Not found" });
    }
    const configValidation = (0, email_config_1.validateEmailConfig)();
    try {
        const connectionTest = await email_service_1.emailService.testConnection();
        res.json({
            config: configValidation,
            connection: {
                status: connectionTest ? 'success' : 'failed',
                message: connectionTest ? 'SMTP connection successful' : 'SMTP connection failed'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Email configuration test failed:', error);
        res.status(500).json({
            config: configValidation,
            connection: {
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error'
            }
        });
    }
};
exports.testEmailConfig = testEmailConfig;
/**
 * Test endpoint to send a test verification email
 * This should only be available in development environment
 */
const sendTestEmail = async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ message: "Not found" });
    }
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email address is required" });
    }
    try {
        // Generate a test token
        const testToken = 'test-verification-token-' + Date.now();
        await email_service_1.emailService.sendVerificationEmail(email, testToken);
        logger_1.default.info(`Test verification email sent to ${email}`);
        res.json({
            success: true,
            message: `Test verification email sent to ${email}`,
            token: testToken
        });
    }
    catch (error) {
        logger_1.default.error(`Failed to send test email to ${email}:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.sendTestEmail = sendTestEmail;
