import bcrypt from "bcrypt";

const rounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

export const hashPassword = (password: string) => bcrypt.hash(password, rounds);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);
export const hashToken = (token: string) => bcrypt.hash(token, rounds);
export const compareTokenHash = (token: string, hash: string) => bcrypt.compare(token, hash);
