import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
        role: string;
    };

    req.user = decoded;
    next();
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ success: false, message: "Forbidden - Insufficient permissions" });
            return;
        }
        next();
    };
};