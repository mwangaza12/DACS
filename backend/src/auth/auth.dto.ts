import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { users } from "../db/schema";
import z from "zod";

export const SelectUserSchema = createSelectSchema(users).omit({ password: true });
export const InsertUserSchema = createInsertSchema(users).omit({ userId: true });

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
export type InsertUserType = z.infer<typeof InsertUserSchema>;
export type LoginType = z.infer<typeof LoginSchema>;