import logger from "../utils/logger";

export const sendVerificationEmail = async (to: string, token: string, name?: string) => {
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  logger.info(`Verification email would be sent to ${to}`, {
    link,
    name,
    recipient: to,
    token
  });
};

export const sendResetPasswordEmail = async (to: string, token: string, name?: string) => {
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  logger.info(`Reset password email would be sent to ${to}`, {
    link,
    name,
    recipient: to,
    token
  });
};
