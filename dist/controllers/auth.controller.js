"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalVerifyToken = exports.me = exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/auth.service"));
const email_service_1 = require("../services/email.service");
const logger_1 = __importDefault(require("../utils/logger"));
const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "email and password required" });
    try {
        const { user, verificationToken } = await authService.registerUser(name, email, password);
        await (0, email_service_1.sendVerificationEmail)(email, verificationToken);
        res.status(201).json({ id: user.id, email: user.email });
    }
    catch (error) {
        logger_1.default.error("Registration failed:", error);
        if (error.message === "SendGrid API key is not configured") {
            return res.status(500).json({ message: "Email service not configured properly" });
        }
        if (error.message === "Failed to send verification email") {
            return res.status(500).json({ message: "Failed to send verification email" });
        }
        return res.status(500).json({ message: "Registration failed" });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await authService.validateUserCredentials(email, password);
    if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
    const tokens = await authService.createTokensForUser(user.id, user.roles);
    res.cookie("refreshToken", tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ accessToken: tokens.accessToken, user: { id: user.id, email: user.email, roles: user.roles } });
};
exports.login = login;
const refreshToken = async (req, res) => {
    const incoming = req.body?.refreshToken ?? req.cookies?.refreshToken;
    if (!incoming)
        return res.status(400).json({ message: "Missing refresh token" });
    try {
        const rotated = await authService.rotateRefreshToken(incoming);
        res.cookie("refreshToken", rotated.refresh, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ accessToken: rotated.access });
    }
    catch (err) {
        logger_1.default.warn("Refresh token failed", { err: err?.message ?? err });
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    const incoming = req.body?.refreshToken ?? req.cookies?.refreshToken;
    if (incoming) {
        await authService.revokeRefreshToken(incoming);
    }
    res.clearCookie("refreshToken");
    res.json({ ok: true });
};
exports.logout = logout;
const verifyEmail = async (req, res) => {
    const token = req.query.token;
    if (!token)
        return res.status(400).json({ message: "Missing token" });
    try {
        await authService.verifyEmailToken(token);
        res.json({ ok: true });
    }
    catch (err) {
        return res.status(400).json({ message: err?.message ?? "Invalid token" });
    }
};
exports.verifyEmail = verifyEmail;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ message: "Missing email" });
    try {
        const result = await authService.createPasswordResetToken(email);
        if (!result)
            return res.json({ ok: true });
        await (0, email_service_1.sendResetPasswordEmail)(email, result.resetToken);
        res.json({ ok: true });
    }
    catch (error) {
        logger_1.default.error("Forgot password failed:", error);
        if (error.message === "SendGrid API key is not configured") {
            return res.status(500).json({ message: "Email service not configured properly" });
        }
        if (error.message === "Failed to send reset password email") {
            return res.status(500).json({ message: "Failed to send reset password email" });
        }
        return res.status(500).json({ message: "Password reset request failed" });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
        return res.status(400).json({ message: "Missing token or password" });
    try {
        await authService.resetPasswordWithToken(token, newPassword);
        res.json({ ok: true });
    }
    catch (err) {
        return res.status(400).json({ message: err?.message ?? "Invalid token" });
    }
};
exports.resetPassword = resetPassword;
const me = async (req, res) => {
    const user = await authService.getUserProfile(req.user.id);
    res.json(user);
};
exports.me = me;
const internalVerifyToken = async (req, res) => {
    const token = req.body?.token;
    if (!token)
        return res.status(400).json({ message: "Missing token" });
    try {
        res.json({ ok: true, message: "Internal verify endpoint - implement verifyAccessToken for production" });
    }
    catch (err) {
        res.status(401).json({ ok: false });
    }
};
exports.internalVerifyToken = internalVerifyToken;
