import { and, eq } from "drizzle-orm";
import { db } from "..";
import { appointments, doctorAvailability } from "../db/schema";
import { InsertAppointmentType, UpdateAppointmentType } from "./appointments.dto";

export const getAllAppointmentsService = async (filters: {
    patientId?: string;
    doctorId?: string;
    status?: string;
    page?: number;
    limit?: number;
}) => {
    const { page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (filters.patientId) conditions.push(eq(appointments.patientId, filters.patientId));
    if (filters.doctorId) conditions.push(eq(appointments.doctorId, filters.doctorId));

    const query = db.select().from(appointments);
    if (conditions.length > 0) query.where(and(...conditions));

    return query.limit(limit).offset(offset);
};

export const getAppointmentByIdService = async (appointmentId: string) => {
    const [appointment] = await db
        .select()
        .from(appointments)
        .where(eq(appointments.appointmentId, appointmentId));
    return appointment ?? null;
};

export const createAppointmentService = async (data: InsertAppointmentType) => {
    const [appointment] = await db.insert(appointments).values(data).returning();
    if (!appointment) throw new Error("Failed to create appointment");
    return appointment;
};

export const updateAppointmentService = async (appointmentId: string, data: UpdateAppointmentType) => {
    const [updated] = await db
        .update(appointments)
        .set({ ...data, updated_at: new Date() })
        .where(eq(appointments.appointmentId, appointmentId))
        .returning();
    return updated ?? null;
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
    return cancelled ?? null;
};

export const getAvailableSlotsService = async (doctorId: string, date: string) => {
    // Get doctor availability for the day of week
    const dayOfWeek = new Date(date).getDay().toString() as "0"|"1"|"2"|"3"|"4"|"5"|"6";

    const [availability] = await db
        .select()
        .from(doctorAvailability)
        .where(
            and(
                eq(doctorAvailability.doctorId, doctorId),
                eq(doctorAvailability.dayOfWeek, dayOfWeek),
                eq(doctorAvailability.isActive, true)
            )
        );

    if (!availability) return [];

    // Get booked appointments for that doctor on that date
    const booked = await db
        .select()
        .from(appointments)
        .where(
            and(
                eq(appointments.doctorId, doctorId),
                eq(appointments.appointmentDate, date)
            )
        );

    const bookedTimes = new Set(booked.map((a) => a.appointmentTime));

    // Generate time slots
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