import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { users, patients, doctors } from "../db/schema";
import z from "zod";

export const SelectUserSchema = createSelectSchema(users).omit({ password: true });

// Base user fields for registration
const BaseRegisterSchema = z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6),
});

// Patient registration — includes required profile fields
export const RegisterPatientSchema = BaseRegisterSchema.extend({
    role: z.literal("patient"),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dateOfBirth: z.string(), // "YYYY-MM-DD"
    gender: z.enum(["male", "female", "other"]),
    nationalId: z.string().optional(),
    insuranceProvider: z.string().optional(),
    insuranceNumber: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
    address: z.string().optional(),
});

// Doctor registration — includes required profile fields
export const RegisterDoctorSchema = BaseRegisterSchema.extend({
    role: z.literal("doctor"),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    specialization: z.string().optional(),
    licenseNumber: z.string().optional(),
    department: z.string().optional(),
    consultationFee: z.string().optional(), // decimal stored as string
});

// Admin registration — no profile table needed
export const RegisterAdminSchema = BaseRegisterSchema.extend({
    role: z.literal("admin"),
});

// Discriminated union — role field drives which schema is used
export const RegisterSchema = z.discriminatedUnion("role", [
    RegisterPatientSchema,
    RegisterDoctorSchema,
    RegisterAdminSchema,
]);

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const RefreshTokenSchema = z.object({
    refreshToken: z.string(),
});

export type SelectUserType = z.infer<typeof SelectUserSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;