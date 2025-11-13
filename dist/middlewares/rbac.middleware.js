"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (role) => {
    return (req, res, next) => {
        const userRoles = req.user?.roles ?? [];
        if (userRoles.includes(role))
            return next();
        return res.status(403).json({ message: "Forbidden" });
    };
};
exports.requireRole = requireRole;
