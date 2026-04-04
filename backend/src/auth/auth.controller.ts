import { Request, Response } from "express";
import { RegisterSchema,LoginSchema,ForgotPasswordSchema,RefreshTokenSchema } from "./auth.dto";
import { getUserByEmailService, getUserByIdService, registerUserService, sendPasswordResetEmailService } from "./auth.service";
import { success } from "../utils/response.handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export const registerUserController = async (req: Request, res: Response) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) throw new Error(parsed.error.message);

    const existing = await getUserByEmailService(parsed.data.email);
    if (existing) throw new Error("Email already in use");

    const passwordHash = bcrypt.hashSync(parsed.data.password, 13);
    const result = await registerUserService(parsed.data, passwordHash);

    return success(res, result, "Registered successfully", 201);
};

export const loginController = async (req: Request, res: Response) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) throw new Error(parsed.error.message);

    const { email, password } = parsed.data;
    const user = await getUserByEmailService(email);

    if (!user) throw new Error("Invalid credentials");
    if (!user.isActive) throw new Error("Account is deactivated");

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const payload = { userId: user.userId, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);

    const { password: _, ...safeUser } = user;
    return success(res, { user: safeUser, accessToken, refreshToken }, "Login successful");
};

export const refreshTokenController = async (req: Request, res: Response) => {
    const parsed = RefreshTokenSchema.safeParse(req.body);
    if (!parsed.success) throw new Error(parsed.error.message);

    const decoded = jwt.verify(parsed.data.refreshToken, JWT_REFRESH_SECRET) as {
        userId: string; email: string; role: string;
    };

    const user = await getUserByIdService(decoded.userId);
    if (!user || !user.isActive) throw new Error("User not found or inactive");

    const payload = { userId: user.userId, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

    return success(res, { accessToken }, "Token refreshed");
};

export const logoutController = async (_req: Request, res: Response) => {
    return success(res, null, "Logged out successfully");
};

export const forgotPasswordController = async (req: Request, res: Response) => {
    const parsed = ForgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) throw new Error(parsed.error.message);

    // Fire-and-forget: never leak whether the email exists via timing or errors
    sendPasswordResetEmailService(parsed.data.email).catch((err) =>
        console.error("[Auth] Password reset email failed:", err)
    );

    return success(res, null, "If the email exists, a reset link has been sent");
};