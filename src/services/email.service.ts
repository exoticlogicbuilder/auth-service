import logger from "../utils/logger";

export const sendVerificationEmail = async (to: string, token: string) => {
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  logger.info(`Send verification email to ${to} with link ${link}`);
};

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  logger.info(`Send reset password email to ${to} with link ${link}`);
};
