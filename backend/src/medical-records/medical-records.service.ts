import { eq } from "drizzle-orm";
import { db } from "..";
import { medicalRecords, patientDocuments } from "../db/schema";
import { InsertMedicalRecordType, InsertPatientDocumentType, UpdateMedicalRecordType } from "./medical-records.dto";

export const getAllMedicalRecordsService = async (patientId?: string, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const query = db.select().from(medicalRecords);
    if (patientId) query.where(eq(medicalRecords.patientId, patientId));
    return query.limit(limit).offset(offset);
};

export const getMedicalRecordByIdService = async (recordId: string) => {
    const [record] = await db
        .select()
        .from(medicalRecords)
        .where(eq(medicalRecords.medicalRecordId, recordId));
    return record ?? null;
};

export const createMedicalRecordService = async (data: InsertMedicalRecordType) => {
    const [record] = await db.insert(medicalRecords).values(data).returning();
    if (!record) throw new Error("Failed to create medical record");
    return record;
};

export const updateMedicalRecordService = async (recordId: string, data: UpdateMedicalRecordType) => {
    const [updated] = await db
        .update(medicalRecords)
        .set({ ...data, updated_at: new Date() })
        .where(eq(medicalRecords.medicalRecordId, recordId))
        .returning();
    return updated ?? null;
};

export const uploadPatientDocumentService = async (data: InsertPatientDocumentType) => {
    const [doc] = await db.insert(patientDocuments).values(data).returning();
    if (!doc) throw new Error("Failed to upload document");
    return doc;
};