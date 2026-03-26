import { eq } from "drizzle-orm";
import { db } from "..";
import { notifications } from "../db/schema";
import { SendNotificationType } from "./notifications.dto";

export const getUserNotificationsService = async (userId: string, page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    return db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .limit(limit)
        .offset(offset);
};

export const markNotificationReadService = async (notificationId: string) => {
    const [updated] = await db
        .update(notifications)
        .set({ notificationsStatus: "delivered", sentAt: new Date() })
        .where(eq(notifications.notificationId, notificationId))
        .returning();
    return updated ?? null;
};

export const sendNotificationService = async (data: SendNotificationType) => {
    const [notification] = await db
        .insert(notifications)
        .values({
            userId: data.userId,
            appointmentId: data.appointmentId ?? null,
            notificationType: data.notificationType,
            subject: data.subject ?? null,
            message: data.message,
            notificationsStatus: "sent",
            sentAt: new Date(),
        })
        .returning();

    if (!notification) throw new Error("Failed to send notification");

    // TODO: Integrate with actual SMS/email/push provider here
    console.log(`[NOTIFICATION] ${data.notificationType.toUpperCase()} sent to user ${data.userId}`);

    return notification;
};