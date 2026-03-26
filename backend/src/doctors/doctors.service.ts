import { eq } from "drizzle-orm";
import { db } from "..";
import { doctors, doctorAvailability } from "../db/schema";
import { InsertAvailabilityType, UpdateAvailabilityType } from "./doctors.dto";

export const getAllDoctorsService = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return db.select().from(doctors).limit(limit).offset(offset);
};

export const getDoctorByIdService = async (doctorId: string) => {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.doctorId, doctorId));
    return doctor ?? null;
};

export const getDoctorAvailabilityService = async (doctorId: string) => {
    return db
        .select()
        .from(doctorAvailability)
        .where(eq(doctorAvailability.doctorId, doctorId));
};

export const upsertDoctorAvailabilityService = async (
    doctorId: string,
    data: UpdateAvailabilityType[]
) => {
    // Delete existing and re-insert
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