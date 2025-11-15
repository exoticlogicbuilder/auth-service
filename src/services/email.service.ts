import sgMail from "@sendgrid/mail";
import logger from "../utils/logger";
import { getVerificationEmailTemplate, getPasswordResetEmailTemplate } from "../templates/email.templates";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@example.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  logger.info("SendGrid API initialized");
} else {
  logger.warn("SENDGRID_API_KEY not set - emails will be logged only");
}

export const sendVerificationEmail = async (to: string, token: string, userName?: string) => {
  const link = `${FRONTEND_URL}/verify-email?token=${token}`;
  const htmlContent = getVerificationEmailTemplate(link, userName);

  if (!SENDGRID_API_KEY) {
    logger.info(`[EMAIL MOCK] Verification email to ${to} with link ${link}`);
    return;
  }

  try {
    await sgMail.send({
      to,
      from: EMAIL_FROM,
      subject: "Verify Your Email Address",
      html: htmlContent,
      text: `Hello${userName ? ` ${userName}` : ''}! Please verify your email by visiting: ${link}. This link expires in 24 hours.`
    });
    logger.info(`Verification email sent to ${to}`);
  } catch (error: any) {
    logger.error("Failed to send verification email", {
      error: error?.message,
      response: error?.response?.body
    });
    throw new Error("Failed to send verification email");
  }
};

export const sendResetPasswordEmail = async (to: string, token: string, userName?: string) => {
  const link = `${FRONTEND_URL}/reset-password?token=${token}`;
  const htmlContent = getPasswordResetEmailTemplate(link, userName);

  if (!SENDGRID_API_KEY) {
    logger.info(`[EMAIL MOCK] Password reset email to ${to} with link ${link}`);
    return;
  }

  try {
    await sgMail.send({
      to,
      from: EMAIL_FROM,
      subject: "Reset Your Password",
      html: htmlContent,
      text: `Hello${userName ? ` ${userName}` : ''}! Reset your password by visiting: ${link}. This link expires in 1 hour.`
    });
    logger.info(`Password reset email sent to ${to}`);
  } catch (error: any) {
    logger.error("Failed to send password reset email", {
      error: error?.message,
      response: error?.response?.body
    });
    throw new Error("Failed to send password reset email");
  }
};
