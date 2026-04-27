/**
 * seed-notifications.ts — Add notifications for devmwangaza@gmail.com
 *
 * Usage (from DACS-main/backend/):
 *   npx tsx seed-notifications.ts
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { users, notifications } from "./src/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db  = drizzle(sql, { casing: "snake_case" });

// ── Notification data ──────────────────────────────────────────────────────────
const APPOINTMENT_NOTIFICATIONS = [
  {
    title:   "Upcoming Appointment Reminder",
    message: "You have an appointment with Dr. Amina Hassan tomorrow at 09:00 AM. Please arrive 10 minutes early.",
    type:    "appointment_reminder",
    isRead:  false,
    createdAt: daysAgo(0),
  },
  {
    title:   "Appointment Confirmed",
    message: "Your appointment with Dr. Daniel Mwangi on Friday at 11:00 AM has been confirmed.",
    type:    "appointment_reminder",
    isRead:  false,
    createdAt: daysAgo(1),
  },
  {
    title:   "Appointment Rescheduled",
    message: "Your appointment originally scheduled for last Monday has been rescheduled. Please log in to confirm the new time.",
    type:    "appointment_reminder",
    isRead:  true,
    createdAt: daysAgo(5),
  },
  {
    title:   "Follow-Up Appointment Due",
    message: "Dr. Grace Karanja has recommended a follow-up visit within the next 7 days. Please book at your earliest convenience.",
    type:    "appointment_reminder",
    isRead:  false,
    createdAt: daysAgo(2),
  },
  {
    title:   "Appointment Cancelled",
    message: "Your appointment on 20th April has been cancelled. Please contact the hospital to reschedule.",
    type:    "appointment_reminder",
    isRead:  true,
    createdAt: daysAgo(10),
  },
];

const SYSTEM_NOTIFICATIONS = [
  {
    title:   "Welcome to DACS",
    message: "Welcome! Your account has been set up successfully. You can now book appointments, view medical records, and manage your health profile.",
    type:    "system",
    isRead:  true,
    createdAt: daysAgo(30),
  },
  {
    title:   "New Lab Results Available",
    message: "Your recent lab results have been uploaded to your medical records. Log in to view them or discuss with your doctor.",
    type:    "system",
    isRead:  false,
    createdAt: daysAgo(3),
  },
  {
    title:   "Prescription Ready for Collection",
    message: "Your prescription for Metformin 500mg is ready for collection at the pharmacy.",
    type:    "system",
    isRead:  false,
    createdAt: daysAgo(1),
  },
  {
    title:   "Insurance Claim Update",
    message: "Your insurance claim CLM-482910 submitted to Jubilee Insurance has been approved. Amount: KES 3,600.",
    type:    "system",
    isRead:  true,
    createdAt: daysAgo(7),
  },
  {
    title:   "Bill Payment Due",
    message: "You have an outstanding bill of KES 700. Please make payment at the billing desk or via M-Pesa Paybill 123456.",
    type:    "system",
    isRead:  false,
    createdAt: daysAgo(4),
  },
  {
    title:   "System Maintenance Notice",
    message: "DACS will undergo scheduled maintenance on Sunday 28th April from 12:00 AM to 3:00 AM. Services may be briefly unavailable.",
    type:    "system",
    isRead:  false,
    createdAt: daysAgo(0),
  },
  {
    title:   "Profile Update Required",
    message: "Please update your emergency contact information to ensure we can reach your next of kin if needed.",
    type:    "system",
    isRead:  true,
    createdAt: daysAgo(14),
  },
];

// ── Helper ─────────────────────────────────────────────────────────────────────
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ── MAIN ───────────────────────────────────────────────────────────────────────
async function seedNotifications() {
  console.log("Looking up user: devmwangaza@gmail.com ...");

  const result = await db
    .select({ userId: users.userId })
    .from(users)
    .where(eq(users.email, "devmwangaza@gmail.com"))
    .limit(1);

  if (result.length === 0) {
    console.error("❌ User devmwangaza@gmail.com not found in the database.");
    process.exit(1);
  }

  const { userId } = result[0];
  console.log(`✔ Found user: ${userId}\n`);

  const allNotifications = [...APPOINTMENT_NOTIFICATIONS, ...SYSTEM_NOTIFICATIONS];

  console.log(`Inserting ${allNotifications.length} notifications...`);

  for (const n of allNotifications) {
    await db.insert(notifications).values({
      notificationId: uuidv4(),
      userId,
      title:     n.title,
      message:   n.message,
      type:      n.type,
      isRead:    n.isRead,
      createdAt: n.createdAt,
    });
    console.log(`  [${n.isRead ? "READ  " : "UNREAD"}] ${n.title}`);
  }

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  console.log("\n--- Done ---");
  console.log(`Total inserted : ${allNotifications.length}`);
  console.log(`  Unread       : ${unreadCount}`);
  console.log(`  Read         : ${allNotifications.length - unreadCount}`);
  console.log(`  Appointment  : ${APPOINTMENT_NOTIFICATIONS.length}`);
  console.log(`  System       : ${SYSTEM_NOTIFICATIONS.length}`);
}

seedNotifications().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});