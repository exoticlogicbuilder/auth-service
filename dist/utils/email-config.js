"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logEmailConfig = exports.validateEmailConfig = void 0;
const logger_1 = __importDefault(require("./logger"));
const validateEmailConfig = () => {
    const requiredFields = [
        'SENDGRID_SMTP_HOST',
        'SENDGRID_SMTP_PORT',
        'SENDGRID_API_KEY',
        'SENDGRID_USERNAME',
        'SENDGRID_PASSWORD',
        'EMAIL_FROM',
        'FRONTEND_URL'
    ];
    const missingFields = [];
    const warnings = [];
    // Check for missing required fields
    requiredFields.forEach(field => {
        if (!process.env[field]) {
            missingFields.push(field);
        }
    });
    // Check for potential configuration issues
    if (process.env.EMAIL_FROM && process.env.EMAIL_FROM === 'no-reply@example.com') {
        warnings.push('EMAIL_FROM is set to the default example value. Please update it to your actual email address.');
    }
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here') {
        warnings.push('SENDGRID_API_KEY is set to the placeholder value. Please update it with your actual SendGrid API key.');
    }
    if (process.env.FRONTEND_URL && process.env.FRONTEND_URL === 'http://localhost:3000') {
        warnings.push('FRONTEND_URL is set to localhost. This is fine for development but should be updated for production.');
    }
    // Validate email format for EMAIL_FROM
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (process.env.EMAIL_FROM && !emailRegex.test(process.env.EMAIL_FROM)) {
        warnings.push('EMAIL_FROM does not appear to be a valid email address.');
    }
    const isValid = missingFields.length === 0;
    if (!isValid) {
        logger_1.default.error('Email configuration validation failed', { missingFields });
    }
    if (warnings.length > 0) {
        logger_1.default.warn('Email configuration warnings', { warnings });
    }
    return {
        isValid,
        missingFields,
        warnings
    };
};
exports.validateEmailConfig = validateEmailConfig;
const logEmailConfig = () => {
    logger_1.default.info('Email Configuration:', {
        host: process.env.SENDGRID_SMTP_HOST,
        port: process.env.SENDGRID_SMTP_PORT,
        username: process.env.SENDGRID_USERNAME,
        from: process.env.EMAIL_FROM,
        frontendUrl: process.env.FRONTEND_URL,
        hasApiKey: !!process.env.SENDGRID_API_KEY,
        hasPassword: !!process.env.SENDGRID_PASSWORD
    });
};
exports.logEmailConfig = logEmailConfig;
