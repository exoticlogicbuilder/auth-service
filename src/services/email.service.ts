import emailService from './smtp-email.service';
import logger from "../utils/logger";

export const sendVerificationEmail = async (to: string, token: string) => {
  try {
    await emailService.sendVerificationEmail(to, token);
    logger.info(`Verification email sent successfully to ${to}`);
  } catch (error) {
    logger.error(`Failed to send verification email to ${to}:`, error);
    throw error;
  }
};

export const sendResetPasswordEmail = async (to: string, token: string) => {
  try {
    await emailService.sendResetPasswordEmail(to, token);
    logger.info(`Password reset email sent successfully to ${to}`);
  } catch (error) {
    logger.error(`Failed to send password reset email to ${to}:`, error);
    throw error;
  }
};

// Export the email service for direct access if needed
export { emailService };
