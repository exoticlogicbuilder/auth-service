"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("../utils/logger"));
const email_config_1 = require("../utils/email-config");
class EmailService {
    constructor() {
        // Validate email configuration before initializing
        const configValidation = (0, email_config_1.validateEmailConfig)();
        if (!configValidation.isValid) {
            logger_1.default.error('Cannot initialize email service: Missing required configuration', {
                missingFields: configValidation.missingFields
            });
            throw new Error(`Email service initialization failed: Missing required fields: ${configValidation.missingFields.join(', ')}`);
        }
        if (configValidation.warnings.length > 0) {
            logger_1.default.warn('Email service initialized with configuration warnings', {
                warnings: configValidation.warnings
            });
        }
        const config = {
            host: process.env.SENDGRID_SMTP_HOST || 'smtp.sendgrid.net',
            port: parseInt(process.env.SENDGRID_SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SENDGRID_USERNAME || 'apikey',
                pass: process.env.SENDGRID_PASSWORD || '',
            },
        };
        this.fromAddress = process.env.EMAIL_FROM || 'no-reply@example.com';
        this.transporter = nodemailer_1.default.createTransport(config);
        // Log configuration (without sensitive data)
        (0, email_config_1.logEmailConfig)();
        // Verify SMTP connection on startup
        this.verifyConnection();
    }
    async verifyConnection() {
        try {
            await this.transporter.verify();
            logger_1.default.info('SMTP connection verified successfully');
        }
        catch (error) {
            logger_1.default.error('SMTP connection verification failed:', error);
        }
    }
    createVerificationEmailTemplate(verificationLink) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border: 1px solid #e9ecef;
              border-radius: 0 0 5px 5px;
            }
            .button {
              display: inline-block;
              background-color: #007bff;
              color: #ffffff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6c757d;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 3px;">
              ${verificationLink}
            </p>
            <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `;
    }
    createPasswordResetEmailTemplate(resetLink) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #ffffff;
              padding: 30px;
              border: 1px solid #e9ecef;
              border-radius: 0 0 5px 5px;
            }
            .button {
              display: inline-block;
              background-color: #dc3545;
              color: #ffffff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #6c757d;
              font-size: 14px;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 10px;
              border-radius: 3px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 3px;">
              ${resetLink}
            </p>
            <div class="warning">
              <strong>Security Notice:</strong> This password reset link will expire in 1 hour for your security.
            </div>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `;
    }
    async sendVerificationEmail(to, token) {
        try {
            const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
            const htmlContent = this.createVerificationEmailTemplate(verificationLink);
            const mailOptions = {
                from: this.fromAddress,
                to: to,
                subject: 'Verify Your Email Address',
                html: htmlContent,
                text: `Please verify your email address by visiting this link: ${verificationLink}`,
            };
            const info = await this.transporter.sendMail(mailOptions);
            logger_1.default.info(`Verification email sent successfully to ${to}`, {
                messageId: info.messageId,
                response: info.response,
            });
        }
        catch (error) {
            logger_1.default.error(`Failed to send verification email to ${to}:`, error);
            throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async sendResetPasswordEmail(to, token) {
        try {
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            const htmlContent = this.createPasswordResetEmailTemplate(resetLink);
            const mailOptions = {
                from: this.fromAddress,
                to: to,
                subject: 'Reset Your Password',
                html: htmlContent,
                text: `Please reset your password by visiting this link: ${resetLink}`,
            };
            const info = await this.transporter.sendMail(mailOptions);
            logger_1.default.info(`Password reset email sent successfully to ${to}`, {
                messageId: info.messageId,
                response: info.response,
            });
        }
        catch (error) {
            logger_1.default.error(`Failed to send password reset email to ${to}:`, error);
            throw new Error(`Failed to send password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async sendEmail(to, subject, htmlContent, textContent) {
        try {
            const mailOptions = {
                from: this.fromAddress,
                to: to,
                subject: subject,
                html: htmlContent,
                text: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML for plain text version
            };
            const info = await this.transporter.sendMail(mailOptions);
            logger_1.default.info(`Email sent successfully to ${to}`, {
                subject,
                messageId: info.messageId,
                response: info.response,
            });
        }
        catch (error) {
            logger_1.default.error(`Failed to send email to ${to}:`, error);
            throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Test method to verify email configuration
    async testConnection() {
        try {
            await this.transporter.verify();
            logger_1.default.info('SMTP connection test successful');
            return true;
        }
        catch (error) {
            logger_1.default.error('SMTP connection test failed:', error);
            return false;
        }
    }
}
// Create and export a singleton instance
const emailService = new EmailService();
exports.default = emailService;
