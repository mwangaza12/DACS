import { and, eq } from "drizzle-orm";
import { db } from "..";
import { appointments, doctorAvailability, doctors, bills, users, patients } from "../db/schema";
import { InsertAppointmentType, UpdateAppointmentType } from "./appointments.dto";
import { paginate } from "../utils/pagination";
import {
    sendEmail,
    appointmentConfirmedHtml,
    appointmentReminderHtml,
    appointmentCancelledHtml,
    billCreatedHtml,
} from "../utils/email";

export const getAllAppointmentsService = async (filters: {
    patientId?: string;
    doctorId?: string;
    status?: string;
    page?: number;
    limit?: number;
}) => {
    const { page = 1, limit = 10 } = filters;
    const { limit: lim, offset } = paginate(page, limit);

    const conditions = [];
    if (filters.patientId) conditions.push(eq(appointments.patientId, filters.patientId));
    if (filters.doctorId) conditions.push(eq(appointments.doctorId, filters.doctorId));

    return db.query.appointments.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        limit: lim,
        offset,
        with: {
            patient: true,
            doctor: true,
        },
    });
};

export const getAppointmentByIdService = async (appointmentId: string) => {
    const appointment = await db.query.appointments.findFirst({
        where: eq(appointments.appointmentId, appointmentId),
        with: {
            patient: {
                with: {
                    user: {
                        columns: {
                            email: true,
                        },
                    },
                },
            },
            doctor: {
                columns: {
                    firstName: true,
                    lastName: true,
                    consultationFee: true,
                },
            },
            bill: true,
            history: true,
        },
    });
    return appointment ?? null;
};

export const createAppointmentService = async (data: InsertAppointmentType) => {
    const [appointment] = await db.insert(appointments).values(data).returning();
    if (!appointment) throw new Error("Failed to create appointment");

    // Fire-and-forget confirmation email
    sendAppointmentConfirmationEmail(appointment).catch((err) =>
        console.error("[Email] Appointment confirmation failed:", err)
    );

    return appointment;
};

export const updateAppointmentService = async (
    appointmentId: string,
    data: UpdateAppointmentType
) => {
    const current = await getAppointmentByIdService(appointmentId);
    if (!current) throw new Error("Appointment not found");

    const [updated] = await db
        .update(appointments)
        .set({ ...data, updated_at: new Date() })
        .where(eq(appointments.appointmentId, appointmentId))
        .returning();

    if (!updated) return null;

    // Auto-create a bill when appointment is marked as completed
    const wasNotCompleted = current.appointmentStatus !== "completed";
    const isNowCompleted = updated.appointmentStatus === "completed";

    if (wasNotCompleted && isNowCompleted && updated.patientId && updated.doctorId) {
        await createBillForAppointment(updated.appointmentId, updated.patientId, updated.doctorId);
    }

    return updated;
};

export const cancelAppointmentService = async (appointmentId: string, reason?: string) => {
    const [cancelled] = await db
        .update(appointments)
        .set({
            appointmentStatus: "cancelled",
            cancellationReason: reason ?? null,
            updated_at: new Date(),
        })
        .where(eq(appointments.appointmentId, appointmentId))
        .returning();

    if (cancelled) {
        sendAppointmentCancellationEmail(cancelled, reason).catch((err) =>
            console.error("[Email] Cancellation email failed:", err)
        );
    }

    return cancelled ?? null;
};

export const getAvailableSlotsService = async (doctorId: string, date: string) => {
    const dayOfWeek = new Date(date).getDay().toString() as "0"|"1"|"2"|"3"|"4"|"5"|"6";

    const availability = await db.query.doctorAvailability.findFirst({
        where: and(
            eq(doctorAvailability.doctorId, doctorId),
            eq(doctorAvailability.dayOfWeek, dayOfWeek),
            eq(doctorAvailability.isActive, true)
        ),
    });

    if (!availability) return [];

    const booked = await db.query.appointments.findMany({
        where: and(
            eq(appointments.doctorId, doctorId),
            eq(appointments.appointmentDate, date)
        ),
        columns: { appointmentTime: true },
    });

    const bookedTimes = new Set(booked.map((a) => a.appointmentTime));
    const slots: string[] = [];
    const slotDuration = availability.slotDuration ?? 30;
    const [startH, startM] = availability.startTime.split(":").map(Number);
    const [endH, endM] = availability.endTime.split(":").map(Number);

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + slotDuration <= end) {
        const h = Math.floor(current / 60).toString().padStart(2, "0");
        const m = (current % 60).toString().padStart(2, "0");
        const slot = `${h}:${m}:00`;
        if (!bookedTimes.has(slot)) slots.push(slot);
        current += slotDuration;
    }

    return slots;
};

// ── Internal helpers ──────────────────────────────────────────────────────────

const createBillForAppointment = async (
    appointmentId: string,
    patientId: string,
    doctorId: string
) => {
    // Use relation to fetch doctor with consultationFee in one query
    const doctor = await db.query.doctors.findFirst({
        where: eq(doctors.doctorId, doctorId),
        columns: { consultationFee: true },
    });

    const fee = doctor?.consultationFee ?? "0";

    // Check if bill already exists via relation
    const existing = await db.query.bills.findFirst({
        where: eq(bills.appointmentId, appointmentId),
        columns: { billId: true },
    });

    if (existing) return;

    const [bill] = await db.insert(bills).values({
        appointmentId,
        patientId,
        amount: fee,
        insuranceCovered: "0",
        patientPayable: fee,
        billStatus: "pending",
    }).returning();

    if (bill) {
        sendBillCreatedEmail(bill.billId, patientId, appointmentId, fee).catch((err) =>
            console.error("[Email] Bill notification failed:", err)
        );
    }
};

// ── Email dispatch helpers ────────────────────────────────────────────────────

type AppointmentRow = typeof appointments.$inferSelect;

/**
 * Replaces the old two-query join with a single relational query.
 * patients → user (for email), patient (for name)
 */
const getPatientEmailAndName = async (patientId: string) => {
    const patient = await db.query.patients.findFirst({
        where: eq(patients.patientId, patientId),
        columns: {
            firstName: true,
            lastName: true,
        },
        with: {
            user: {
                columns: { email: true },
            },
        },
    });

    if (!patient) return null;

    return {
        email: patient.user.email,
        firstName: patient.firstName,
        lastName: patient.lastName,
    };
};

/**
 * Replaces the old select query — fetches doctor name via relation.
 */
const getDoctorName = async (doctorId: string) => {
    const doctor = await db.query.doctors.findFirst({
        where: eq(doctors.doctorId, doctorId),
        columns: {
            firstName: true,
            lastName: true,
        },
    });
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Your Doctor";
};

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    return `${((h % 12) || 12).toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${suffix}`;
};

const sendAppointmentConfirmationEmail = async (appt: AppointmentRow) => {
    if (!appt.patientId || !appt.doctorId) return;
    const patient = await getPatientEmailAndName(appt.patientId);
    if (!patient) return;
    const doctorName = await getDoctorName(appt.doctorId);

    await sendEmail({
        to: patient.email,
        subject: "Appointment Confirmed — DACS Health",
        html: appointmentConfirmedHtml({
            patientName: `${patient.firstName} ${patient.lastName}`,
            doctorName,
            date: formatDate(appt.appointmentDate),
            time: formatTime(appt.appointmentTime),
            type: appt.appointmentType ?? "regular",
            appointmentId: appt.appointmentId,
        }),
    });
};

const sendAppointmentCancellationEmail = async (appt: AppointmentRow, reason?: string) => {
    if (!appt.patientId || !appt.doctorId) return;
    const patient = await getPatientEmailAndName(appt.patientId);
    if (!patient) return;
    const doctorName = await getDoctorName(appt.doctorId);

    await sendEmail({
        to: patient.email,
        subject: "Appointment Cancelled — DACS Health",
        html: appointmentCancelledHtml({
            patientName: `${patient.firstName} ${patient.lastName}`,
            doctorName,
            date: formatDate(appt.appointmentDate),
            time: formatTime(appt.appointmentTime),
            reason,
            appointmentId: appt.appointmentId,
        }),
    });
};

const sendBillCreatedEmail = async (
    billId: string,
    patientId: string,
    appointmentId: string,
    amount: string
) => {
    const patient = await getPatientEmailAndName(patientId);
    if (!patient) return;

    await sendEmail({
        to: patient.email,
        subject: "New Bill Generated — DACS Health",
        html: billCreatedHtml({
            patientName: `${patient.firstName} ${patient.lastName}`,
            amount,
            billId,
            appointmentId,
        }),
    });
};