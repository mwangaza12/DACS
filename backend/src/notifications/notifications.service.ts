import { eq } from "drizzle-orm";
import { db } from "..";
import { notifications, users } from "../db/schema";
import { SendNotificationType } from "./notifications.dto";
import { sendEmail } from "../utils/email";

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
    // 1. Persist notification record immediately (status = pending)
    const [notification] = await db
        .insert(notifications)
        .values({
            userId: data.userId,
            appointmentId: data.appointmentId ?? null,
            notificationType: data.notificationType,
            subject: data.subject ?? null,
            message: data.message,
            notificationsStatus: "pending",
            sentAt: null,
        })
        .returning();

    if (!notification) throw new Error("Failed to create notification record");

    // 2. Dispatch to the appropriate channel
    let deliveryError: string | null = null;

    try {
        if (data.notificationType === "email") {
            await dispatchEmail(data);
        } else {
            // SMS / push / in_app: log for now — swap in your provider SDK when ready
            console.log(
                `[NOTIFICATION] ${data.notificationType.toUpperCase()} → user ${data.userId}: ${data.message}`
            );
        }
    } catch (err) {
        deliveryError = err instanceof Error ? err.message : String(err);
        console.error(`[NOTIFICATION] Delivery failed for ${notification.notificationId}:`, deliveryError);
    }

    // 3. Update record to reflect delivery outcome
    const finalStatus = deliveryError ? "failed" : "sent";
    const [updated] = await db
        .update(notifications)
        .set({ notificationsStatus: finalStatus, sentAt: new Date() })
        .where(eq(notifications.notificationId, notification.notificationId))
        .returning();

    return updated ?? notification;
};

// ── Internal helpers ──────────────────────────────────────────────────────────

const dispatchEmail = async (data: SendNotificationType) => {
    const [user] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.userId, data.userId));

    if (!user?.email) {
        throw new Error(`No email address found for user ${data.userId}`);
    }

    await sendEmail({
        to: user.email,
        subject: data.subject ?? "DACS Health Notification",
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
              <h2 style="color:#1a6fcc;margin-top:0;">${data.subject ?? "Notification"}</h2>
              <p style="color:#333;line-height:1.6;">${data.message}</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
              <p style="font-size:12px;color:#999;">DACS Health System — automated notification</p>
            </div>
        `,
        text: data.message,
    });
};