import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const baseRegisterSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const registerPatientSchema = baseRegisterSchema.extend({
  role: z.literal("patient"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  nationalId: z.string().optional(),
  insuranceProvider: z.string().optional(),
  address: z.string().optional(),
});

export const registerDoctorSchema = baseRegisterSchema.extend({
  role: z.literal("doctor"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  department: z.string().optional(),
  consultationFee: z.string().optional(),
});

export const registerAdminSchema = baseRegisterSchema.extend({
  role: z.literal("admin"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type RegisterPatientFormData = z.infer<typeof registerPatientSchema>;
export type RegisterDoctorFormData = z.infer<typeof registerDoctorSchema>;
