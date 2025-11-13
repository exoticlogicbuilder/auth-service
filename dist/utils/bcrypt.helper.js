"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareTokenHash = exports.hashToken = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const rounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);
const hashPassword = (password) => bcrypt_1.default.hash(password, rounds);
exports.hashPassword = hashPassword;
const comparePassword = (password, hash) => bcrypt_1.default.compare(password, hash);
exports.comparePassword = comparePassword;
const hashToken = (token) => bcrypt_1.default.hash(token, rounds);
exports.hashToken = hashToken;
const compareTokenHash = (token, hash) => bcrypt_1.default.compare(token, hash);
exports.compareTokenHash = compareTokenHash;
