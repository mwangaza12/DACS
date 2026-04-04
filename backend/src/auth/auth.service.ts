import { eq } from "drizzle-orm";
import { db } from "..";
import { users, patients, doctors } from "../db/schema";
import { RegisterInput } from "./auth.dto";
import { sendEmail, welcomeHtml, passwordResetHtml } from "../utils/email";

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
 * Sends a password-reset email.
 * In production, generate a signed JWT reset token and embed it in the link.
 */
export const sendPasswordResetEmailService = async (email: string) => {
    const user = await getUserByEmailService(email);
    if (!user) return; // silently ignore unknown emails (security: don't leak existence)

    const frontendBaseUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

    // TODO: replace with a real signed JWT reset token stored in DB
    const resetToken = Buffer.from(`${user.userId}:${Date.now()}`).toString("base64url");
    const resetLink = `${frontendBaseUrl}/reset-password?token=${resetToken}`;

    const displayName = email.split("@")[0];

    await sendEmail({
        to: email,
        subject: "Password Reset Request — DACS Health",
        html: passwordResetHtml({ name: displayName, resetLink }),
    });

    console.log(`[Auth] Password reset email sent to ${email}`);
};