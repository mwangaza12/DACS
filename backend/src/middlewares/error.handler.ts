import { Request, Response, NextFunction } from "express";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(`[ERROR] ${err.message}`, err.stack);

    // Zod validation errors
    if (err.name === "ZodError") {
        res.status(400).json({
            success: false,
            message: "Validation error",
            errors: JSON.parse(err.message),
        });
        return;
    }

    // JWT errors
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
        return;
    }

    res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
    });
};