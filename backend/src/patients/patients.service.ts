import { eq } from "drizzle-orm";
import { db } from "..";
import { patients, medicalRecords } from "../db/schema";
import { InsertPatientType, UpdatePatientType } from "./patients.dto";
import { paginate } from "../utils/pagination";

export const getAllPatientsService = async (page = 1, limit = 10) => {
    const { limit: lim, offset } = paginate(page, limit);
    return db.select().from(patients).limit(lim).offset(offset);
};

export const getPatientByIdService = async (patientId: string) => {
    const [patient] = await db.select().from(patients).where(eq(patients.patientId, patientId));
    return patient ?? null;
};

export const updatePatientService = async (patientId: string, data: UpdatePatientType) => {
    const [updated] = await db
        .update(patients)
        .set(data)
        .where(eq(patients.patientId, patientId))
        .returning();
    return updated ?? null;
};

export const getPatientMedicalRecordsService = async (patientId: string) => {
    return db.select().from(medicalRecords).where(eq(medicalRecords.patientId, patientId));
};