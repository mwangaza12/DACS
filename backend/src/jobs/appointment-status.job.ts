import { lt, and, inArray } from "drizzle-orm";
import { db } from "..";
import { appointments, appointmentHistory } from "../db/schema";

export const markStaleAppointmentsJob = async () => {
    const today = new Date().toISOString().slice(0, 10);

    // Step 1 — fetch stale appointments BEFORE updating
    // so we capture the real previousStatus for the audit log
    const stale = await db.query.appointments.findMany({
        where: and(
            lt(appointments.appointmentDate, today),
            inArray(appointments.appointmentStatus, [
                "scheduled",
                "confirmed",
                "rescheduled",
            ])
        ),
        columns: {
            appointmentId: true,
            appointmentStatus: true,
        },
    });

    if (stale.length === 0) {
        console.log("[JOB] No stale appointments found");
        return 0;
    }

    const ids = stale.map((a) => a.appointmentId);

    // Step 2 — bulk update
    await db
        .update(appointments)
        .set({
            appointmentStatus: "no_show",
            updated_at: new Date(),
        })
        .where(inArray(appointments.appointmentId, ids));

    // Step 3 — audit log
    await db.insert(appointmentHistory).values(
        stale.map((a) => ({
            appointmentId: a.appointmentId,
            previousStatus: a.appointmentStatus,
            newStatus: "no_show",
            changeReason: "Automatically marked by system — appointment date passed without check-in",
            changedAt: new Date(),
        }))
    );

    console.log(`[JOB] Marked ${stale.length} stale appointment(s) as no_show`);
    return stale.length;
};