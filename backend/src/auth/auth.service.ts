import { eq, and, sql, gt } from "drizzle-orm";
import { db } from "..";
import { users, patients, doctors, passwordResetTokens } from "../db/schema";
import { RegisterInput } from "./auth.dto";
import { sendEmail, welcomeHtml, passwordResetHtml } from "../utils/email";
import bcrypt from "bcrypt";
import crypto from "crypto";

export const registerUserService = async (input: RegisterInput, passwordHash: string) => {
    // Step 1: insert the user
    const [user] = await db
        .insert(users)
        .values({
            email: input.email,
            phone: input.phone ?? null,
            password: passwordHash,
            role: input.role,
        })
        .returning();

    if (!user) throw new Error("Failed to create user account");

    // Step 2: insert the role profile — if this fails, clean up the user row
    try {
        if (input.role === "patient") {
            const [patient] = await db
                .insert(patients)
                .values({
                    patientId: user.userId,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    dateOfBirth: input.dateOfBirth,
                    gender: input.gender,
                    nationalId: input.nationalId ?? null,
                    insuranceProvider: input.insuranceProvider ?? null,
                    insuranceNumber: input.insuranceNumber ?? null,
                    emergencyContactName: input.emergencyContactName ?? null,
                    emergencyContactPhone: input.emergencyContactPhone ?? null,
                    address: input.address ?? null,
                })
                .returning();

            // Fire-and-forget welcome email
            sendEmail({
                to: user.email,
                subject: "Welcome to DACS Health!",
                html: welcomeHtml({ name: input.firstName, role: "Patient" }),
            }).catch((err) => console.error("[Email] Welcome email failed:", err));

            const { password: _, ...safeUser } = user;
            return { user: safeUser, profile: patient };
        }

        if (input.role === "doctor") {
            const [doctor] = await db
                .insert(doctors)
                .values({
                    doctorId: user.userId,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    specialization: input.specialization ?? null,
                    licenseNumber: input.licenseNumber ?? null,
                    department: input.department ?? null,
                    consultationFee: input.consultationFee ?? null,
                })
                .returning();

            // Fire-and-forget welcome email
            sendEmail({
                to: user.email,
                subject: "Welcome to DACS Health!",
                html: welcomeHtml({ name: input.firstName, role: "Doctor" }),
            }).catch((err) => console.error("[Email] Welcome email failed:", err));

            const { password: _, ...safeUser } = user;
            return { user: safeUser, profile: doctor };
        }

        // admin — no profile table
        const { password: _, ...safeUser } = user;
        return { user: safeUser, profile: null };

    } catch (err) {
        // Compensating delete — avoids orphaned user rows on profile insert failure
        await db.delete(users).where(eq(users.userId, user.userId)).catch(() => {});
        throw err;
    }
};

export const getUserByEmailService = async (email: string) => {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user ?? null;
};

export const getUserByIdService = async (userId: string) => {
    const [user] = await db.select().from(users).where(eq(users.userId, userId));
    return user ?? null;
};

/**
 * Creates a password reset token for a user
 */
export const createPasswordResetTokenService = async (userId: string): Promise<string> => {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration
    
    // Invalidate any existing unused tokens for this user
    await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(
            and(
                eq(passwordResetTokens.userId, userId),
                eq(passwordResetTokens.used, false)
            )
        );
    
    const [resetToken] = await db
        .insert(passwordResetTokens)
        .values({
            userId,
            token,
            expiresAt,
            used: false,
        })
        .returning();
    
    if (!resetToken) throw new Error("Failed to create reset token");
    return token;
};

/**
 * Validates a password reset token
 */
export const validateResetTokenService = async (token: string) => {
    const now = new Date();

    const [resetToken] = await db
        .select()
        .from(passwordResetTokens)
        .where(
            and(
                eq(passwordResetTokens.token, token),
                eq(passwordResetTokens.used, false),
                gt(passwordResetTokens.expiresAt, now)  // ← replaces sql`... > NOW()`
            )
        );

    if (!resetToken) throw new Error("Invalid or expired reset token");

    const user = await getUserByIdService(resetToken.userId);
    if (!user || !user.isActive) throw new Error("User not found or inactive");

    return { resetToken, user };
};

/**
 * Resets user password using a valid token
 */
export const resetPasswordService = async (token: string, newPassword: string) => {
    const { resetToken, user } = await validateResetTokenService(token);
    const passwordHash = bcrypt.hashSync(newPassword, 13);
    
    const [updatedUser] = await db
        .update(users)
        .set({ password: passwordHash })
        .where(eq(users.userId, user.userId))
        .returning();
    
    if (!updatedUser) throw new Error("Failed to update password");
    
    await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, resetToken.id));
    
    const { password: _, ...safeUser } = updatedUser;
    return safeUser;
};

/**
 * Sends a password-reset email.
 * In production, generate a signed JWT reset token and embed it in the link.
 */
export const sendPasswordResetEmailService = async (email: string) => {
    const user = await getUserByEmailService(email);
    if (!user) return; // silently ignore unknown emails (security: don't leak existence)

    const frontendBaseUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

    // Create a secure reset token
    const resetToken = await createPasswordResetTokenService(user.userId);
    const resetLink = `${frontendBaseUrl}/reset-password?token=${resetToken}`;

    const displayName = email.split("@")[0];

    await sendEmail({
        to: email,
        subject: "Password Reset Request — DACS Health",
        html: passwordResetHtml({ name: displayName, resetLink }),
    });

    console.log(`[Auth] Password reset email sent to ${email}`);
};