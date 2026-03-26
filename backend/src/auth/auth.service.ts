import { eq } from "drizzle-orm";
import { db } from "..";
import { users, patients, doctors } from "../db/schema";
import { RegisterInput } from "./auth.dto";

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