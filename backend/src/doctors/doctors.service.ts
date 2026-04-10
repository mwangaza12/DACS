import { eq } from "drizzle-orm";
import { db } from "..";
import { doctors, doctorAvailability } from "../db/schema";
import { InsertAvailabilityType, UpdateAvailabilityType } from "./doctors.dto";

export const getAllDoctorsService = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    return db.query.doctors.findMany({
        limit,
        offset,
        with: {
            user: {
                columns: {
                    email: true,
                    phone: true,
                    isActive: true,
                },
            },
            availability: {
                where: eq(doctorAvailability.isActive, true),
                columns: {
                    dayOfWeek: true,
                    startTime: true,
                    endTime: true,
                    slotDuration: true,
                },
            },
        },
    });
};

export const getDoctorByIdService = async (doctorId: string) => {
    const doctor = await db.query.doctors.findFirst({
        where: eq(doctors.doctorId, doctorId),
        with: {
            user: {
                columns: {
                    email: true,
                    phone: true,
                    isActive: true,
                },
            },
            availability: {
                where: eq(doctorAvailability.isActive, true),
            },
            appointments: {
                columns: {
                    appointmentId: true,
                    appointmentDate: true,
                    appointmentTime: true,
                    appointmentStatus: true,
                    appointmentType: true,
                },
                limit: 5,
            },
        },
    });

    return doctor ?? null;
};

export const getDoctorAvailabilityService = async (doctorId: string) => {
    return db.query.doctorAvailability.findMany({
        where: eq(doctorAvailability.doctorId, doctorId),
        with: {
            doctor: {
                columns: {
                    firstName: true,
                    lastName: true,
                    specialization: true,
                    department: true,
                },
            },
        },
    });
};

// Upsert stays as-is — delete + re-insert is a write operation,
// relational API is read-only so core API is correct here
export const upsertDoctorAvailabilityService = async (
    doctorId: string,
    data: UpdateAvailabilityType[]
) => {
    await db.delete(doctorAvailability).where(eq(doctorAvailability.doctorId, doctorId));

    if (data.length === 0) return [];

    const toInsert: InsertAvailabilityType[] = data.map((slot) => ({
        ...slot,
        doctorId,
        startTime: slot.startTime!,
        endTime: slot.endTime!,
    }));

    return db.insert(doctorAvailability).values(toInsert).returning();
};