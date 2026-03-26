import { Request, Response } from "express";
import { InsertUserSchema, LoginSchema, ForgotPasswordSchema, RefreshTokenSchema } from "./auth.dto";
import { getUserByEmailService, getUserByIdService, registerUserService } from "./auth.service";
import { success } from "../utils/response.handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export const registerUserController = async (req: Request, res: Response) => {
    const userData = InsertUserSchema.safeParse(req.body);
    if (userData.error) throw new Error(userData.error.message);

    const existingUser = await getUserByEmailService(userData.data.email);
    if (existingUser) throw new Error("Email already in use");

    const passwordHash = bcrypt.hashSync(userData.data.password, 13);
    const newUser = await registerUserService({ ...userData.data, password: passwordHash });

    return success(res, newUser, "User registered successfully", 201);
};

export const loginController = async (req: Request, res: Response) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (parsed.error) throw new Error(parsed.error.message);

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
    if (parsed.error) throw new Error(parsed.error.message);

    const decoded = jwt.verify(parsed.data.refreshToken, JWT_REFRESH_SECRET) as {
        userId: string; email: string; role: string;
    };

    const user = await getUserByIdService(decoded.userId);
    if (!user || !user.isActive) throw new Error("User not found or inactive");

    const payload = { userId: user.userId, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

    return success(res, { accessToken }, "Token refreshed successfully");
};

export const logoutController = async (req: Request, res: Response) => {
    // In a production system, you'd blacklist the token here
    return success(res, null, "Logged out successfully");
};

export const forgotPasswordController = async (req: Request, res: Response) => {
    const parsed = ForgotPasswordSchema.safeParse(req.body);
    if (parsed.error) throw new Error(parsed.error.message);

    const user = await getUserByEmailService(parsed.data.email);
    // Always return success to prevent email enumeration
    if (user) {
        // TODO: Send password reset email
        console.log(`Password reset requested for: ${parsed.data.email}`);
    }

    return success(res, null, "If the email exists, a reset link has been sent");
};