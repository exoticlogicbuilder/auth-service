import sgMail from "@sendgrid/mail";
import logger from "../utils/logger";

// Initialize SendGrid with API key
const sgApiKey = process.env.SENDGRID_API_KEY;
if (!sgApiKey) {
  logger.warn("SENDGRID_API_KEY is not set. Email functionality will not work in production.");
} else {
  sgMail.setApiKey(sgApiKey);
}

const getEmailFromAddress = () => {
  const emailFrom = process.env.EMAIL_FROM;
  if (!emailFrom) {
    throw new Error("EMAIL_FROM environment variable is not set");
  }
  return emailFrom;
};

const getVerificationEmailTemplate = (
  recipientEmail: string,
  verificationLink: string,
  recipientName?: string
) => {
  return {
    to: recipientEmail,
    from: getEmailFromAddress(),
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
          <h1 style="color: #333; margin-top: 0;">Email Verification Required</h1>
          <p style="color: #666; font-size: 16px;">
            Hi ${recipientName || "there"},
          </p>
          <p style="color: #666; font-size: 16px;">
            Thank you for registering. Please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #007bff; font-size: 12px; word-break: break-all;">
            ${verificationLink}
          </p>
          <p style="color: #999; font-size: 14px;">
            This link will expire in 24 hours.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
    text: `
      Email Verification Required

      Hi ${recipientName || "there"},

      Thank you for registering. Please verify your email address by visiting this link:
      ${verificationLink}

      This link will expire in 24 hours.

      If you didn't create this account, you can safely ignore this email.
    `
  };
};

const getResetPasswordEmailTemplate = (
  recipientEmail: string,
  resetLink: string,
  recipientName?: string
) => {
  return {
    to: recipientEmail,
    from: getEmailFromAddress(),
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
          <h1 style="color: #333; margin-top: 0;">Password Reset Request</h1>
          <p style="color: #666; font-size: 16px;">
            Hi ${recipientName || "there"},
          </p>
          <p style="color: #666; font-size: 16px;">
            We received a request to reset your password. Click the button below to proceed:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 14px;">
            Or copy and paste this link in your browser:
          </p>
          <p style="color: #007bff; font-size: 12px; word-break: break-all;">
            ${resetLink}
          </p>
          <p style="color: #999; font-size: 14px;">
            This link will expire in 1 hour.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            If you didn't request a password reset, please ignore this email. Your account is still secure.
          </p>
        </div>
      </div>
    `,
    text: `
      Password Reset Request

      Hi ${recipientName || "there"},

      We received a request to reset your password. Visit this link to proceed:
      ${resetLink}

      This link will expire in 1 hour.

      If you didn't request a password reset, please ignore this email. Your account is still secure.
    `
  };
};

export const sendVerificationEmail = async (to: string, token: string, name?: string) => {
  try {
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const msg = getVerificationEmailTemplate(to, link, name);

    if (!sgApiKey) {
      // Development mode: log the email instead of sending
      logger.info(`[DEV MODE] Verification email would be sent to ${to}`, {
        link,
        name,
        message: msg
      });
      return;
    }

    await sgMail.send(msg);
    logger.info(`Verification email sent to ${to}`);
  } catch (error: any) {
    logger.error("Failed to send verification email", {
      error: error?.message || error,
      to
    });
    throw new Error(`Failed to send verification email: ${error?.message || "Unknown error"}`);
  }
};

export const sendResetPasswordEmail = async (to: string, token: string, name?: string) => {
  try {
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const msg = getResetPasswordEmailTemplate(to, link, name);

    if (!sgApiKey) {
      // Development mode: log the email instead of sending
      logger.info(`[DEV MODE] Reset password email would be sent to ${to}`, {
        link,
        name,
        message: msg
      });
      return;
    }

    await sgMail.send(msg);
    logger.info(`Reset password email sent to ${to}`);
  } catch (error: any) {
    logger.error("Failed to send reset password email", {
      error: error?.message || error,
      to
    });
    throw new Error(`Failed to send reset password email: ${error?.message || "Unknown error"}`);
  }
};
