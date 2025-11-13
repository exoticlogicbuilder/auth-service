"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.getUserRoles = exports.validateUserCredentials = exports.resetPasswordWithToken = exports.createPasswordResetToken = exports.verifyEmailToken = exports.revokeRefreshToken = exports.rotateRefreshToken = exports.createTokensForUser = exports.registerUser = void 0;
const client_1 = require("@prisma/client");
const bcrypt_helper_1 = require("../utils/bcrypt.helper");
const token_service_1 = require("./token.service");
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
const EMAIL_TOKEN_EXP_HOURS = Number(process.env.EMAIL_TOKEN_EXP_HOURS ?? 24);
const registerUser = async (name, email, password) => {
    const passwordHash = await (0, bcrypt_helper_1.hashPassword)(password);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            roles: ["USER"]
        }
    });
    const rawToken = (0, crypto_1.randomBytes)(32).toString("hex");
    const tokenHash = await (0, bcrypt_helper_1.hashToken)(rawToken);
    const expiresAt = new Date(Date.now() + EMAIL_TOKEN_EXP_HOURS * 60 * 60 * 1000);
    await prisma.emailToken.create({
        data: {
            tokenHash,
            userId: user.id,
            type: "verify",
            expiresAt
        }
    });
    return { user, verificationToken: rawToken };
};
exports.registerUser = registerUser;
const createTokensForUser = async (userId, roles) => {
    const access = (0, token_service_1.signAccessToken)({ userId, roles });
    const refresh = (0, token_service_1.signRefreshToken)(userId);
    const tokenHash = await (0, bcrypt_helper_1.hashToken)(refresh.token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const record = await prisma.refreshToken.create({
        data: {
            tokenHash,
            userId,
            expiresAt
        }
    });
    return {
        accessToken: access.token,
        refreshToken: refresh.token,
        refreshTokenId: record.id
    };
};
exports.createTokensForUser = createTokensForUser;
const rotateRefreshToken = async (oldTokenRaw) => {
    const payload = (0, token_service_1.verifyRefreshToken)(oldTokenRaw);
    const userId = payload.sub;
    const tokens = await prisma.refreshToken.findMany({ where: { userId, revoked: false } });
    for (const t of tokens) {
        if (await (0, bcrypt_helper_1.compareTokenHash)(oldTokenRaw, t.tokenHash)) {
            await prisma.refreshToken.update({ where: { id: t.id }, data: { revoked: true } });
            const newRefresh = (0, token_service_1.signRefreshToken)(userId);
            const tokenHash = await (0, bcrypt_helper_1.hashToken)(newRefresh.token);
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const created = await prisma.refreshToken.create({
                data: { tokenHash, userId, expiresAt, replacedById: undefined }
            });
            return { access: (0, token_service_1.signAccessToken)({ userId, roles: (await (0, exports.getUserRoles)(userId)) }).token, refresh: newRefresh.token };
        }
    }
    throw new Error("Refresh token not found / invalid");
};
exports.rotateRefreshToken = rotateRefreshToken;
const revokeRefreshToken = async (raw) => {
    const payload = (0, token_service_1.verifyRefreshToken)(raw);
    const userId = payload.sub;
    const tokens = await prisma.refreshToken.findMany({ where: { userId, revoked: false } });
    for (const t of tokens) {
        if (await (0, bcrypt_helper_1.compareTokenHash)(raw, t.tokenHash)) {
            await prisma.refreshToken.update({ where: { id: t.id }, data: { revoked: true } });
            return true;
        }
    }
    return false;
};
exports.revokeRefreshToken = revokeRefreshToken;
const verifyEmailToken = async (rawToken) => {
    const tokens = await prisma.emailToken.findMany({ where: { type: "verify", used: false } });
    for (const t of tokens) {
        const match = await (0, bcrypt_helper_1.compareTokenHash)(rawToken, t.tokenHash);
        if (match) {
            if (t.expiresAt < new Date())
                throw new Error("Token expired");
            await prisma.user.update({ where: { id: t.userId }, data: { emailVerified: true } });
            await prisma.emailToken.update({ where: { id: t.id }, data: { used: true } });
            return true;
        }
    }
    return false;
};
exports.verifyEmailToken = verifyEmailToken;
const createPasswordResetToken = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return null;
    const rawToken = (0, crypto_1.randomBytes)(32).toString("hex");
    const tokenHash = await (0, bcrypt_helper_1.hashToken)(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.emailToken.create({
        data: { tokenHash, userId: user.id, type: "reset", expiresAt }
    });
    return { user, resetToken: rawToken };
};
exports.createPasswordResetToken = createPasswordResetToken;
const resetPasswordWithToken = async (rawToken, newPassword) => {
    const tokens = await prisma.emailToken.findMany({ where: { type: "reset", used: false } });
    for (const t of tokens) {
        if (await (0, bcrypt_helper_1.compareTokenHash)(rawToken, t.tokenHash)) {
            if (t.expiresAt < new Date())
                throw new Error("Token expired");
            const passwordHash = await (0, bcrypt_helper_1.hashPassword)(newPassword);
            await prisma.user.update({ where: { id: t.userId }, data: { passwordHash } });
            await prisma.emailToken.update({ where: { id: t.id }, data: { used: true } });
            return true;
        }
    }
    return false;
};
exports.resetPasswordWithToken = resetPasswordWithToken;
const validateUserCredentials = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return null;
    const ok = await (0, bcrypt_helper_1.comparePassword)(password, user.passwordHash);
    if (!ok)
        return null;
    return user;
};
exports.validateUserCredentials = validateUserCredentials;
const getUserRoles = async (userId) => {
    const u = await prisma.user.findUnique({ where: { id: userId } });
    return u?.roles ?? [];
};
exports.getUserRoles = getUserRoles;
const getUserProfile = async (userId) => {
    return prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, roles: true, emailVerified: true } });
};
exports.getUserProfile = getUserProfile;
