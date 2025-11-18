import { sendVerificationEmail, sendResetPasswordEmail } from "../services/email.service";
import logger from "../utils/logger";

jest.mock("../utils/logger");

describe("Email Service", () => {
  const testEmail = "test@example.com";
  const testToken = "test-token-123456";
  const testName = "Test User";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendVerificationEmail", () => {
    it("should send verification email with correct parameters", async () => {
      await sendVerificationEmail(testEmail, testToken, testName);
      expect(logger.info).toHaveBeenCalled();
    });

    it("should send verification email without name", async () => {
      await sendVerificationEmail(testEmail, testToken);
      expect(logger.info).toHaveBeenCalled();
    });

    it("should log info with email link", async () => {
      await sendVerificationEmail(testEmail, testToken, testName);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Verification email would be sent"),
        expect.objectContaining({
          recipient: testEmail,
          token: testToken
        })
      );
    });
  });

  describe("sendResetPasswordEmail", () => {
    it("should send reset password email with correct parameters", async () => {
      await sendResetPasswordEmail(testEmail, testToken, testName);
      expect(logger.info).toHaveBeenCalled();
    });

    it("should send reset password email without name", async () => {
      await sendResetPasswordEmail(testEmail, testToken);
      expect(logger.info).toHaveBeenCalled();
    });

    it("should log info with reset link", async () => {
      await sendResetPasswordEmail(testEmail, testToken, testName);
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Reset password email would be sent"),
        expect.objectContaining({
          recipient: testEmail,
          token: testToken
        })
      );
    });
  });
});