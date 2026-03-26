import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { notifications } from "../db/schema";
import z from "zod";

export const SelectNotificationSchema = createSelectSchema(notifications);
export const InsertNotificationSchema = createInsertSchema(notifications).omit({ notificationId: true });

export const SendNotificationSchema = z.object({
    userId: z.string().uuid(),
    notificationType: z.enum(["sms", "email", "push", "in_app"]).default("email"),
    subject: z.string().max(255).optional(),
    message: z.string().min(1),
    appointmentId: z.string().uuid().optional(),
});

export type SelectNotificationType = z.infer<typeof SelectNotificationSchema>;
export type SendNotificationType = z.infer<typeof SendNotificationSchema>;