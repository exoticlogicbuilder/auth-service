import { Request, Response } from "express";
import { emailService } from "../services/email.service";
import { validateEmailConfig } from "../utils/email-config";
import logger from "../utils/logger";

/**
 * Test endpoint to verify email configuration
 * This should only be available in development environment
 */
export const testEmailConfig = async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: "Not found" });
  }

  const configValidation = validateEmailConfig();
  
  try {
    const connectionTest = await emailService.testConnection();
    
    res.json({
      config: configValidation,
      connection: {
        status: connectionTest ? 'success' : 'failed',
        message: connectionTest ? 'SMTP connection successful' : 'SMTP connection failed'
      }
    });
  } catch (error) {
    logger.error('Email configuration test failed:', error);
    res.status(500).json({
      config: configValidation,
      connection: {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

/**
 * Test endpoint to send a test verification email
 * This should only be available in development environment
 */
export const sendTestEmail = async (req: Request, res: Response) => {
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
    
    await emailService.sendVerificationEmail(email, testToken);
    
    logger.info(`Test verification email sent to ${email}`);
    
    res.json({
      success: true,
      message: `Test verification email sent to ${email}`,
      token: testToken
    });
  } catch (error) {
    logger.error(`Failed to send test email to ${email}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};