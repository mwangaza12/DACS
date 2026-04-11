import { eq } from "drizzle-orm";
import { db } from "..";
import { medicalRecords, patientDocuments } from "../db/schema";
import {
    InsertMedicalRecordType,
    InsertPatientDocumentType,
    UpdateMedicalRecordType,
} from "./medical-records.dto";

export const getAllMedicalRecordsService = async (patientId?: string, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    return db.query.medicalRecords.findMany({
        where: patientId ? eq(medicalRecords.patientId, patientId) : undefined,
        limit,
        offset,
        with: {
            patient: {
                columns: {
                    firstName: true,
                    lastName: true,
                    dateOfBirth: true,
                    gender: true,
                },
            },
            doctor: {
                columns: {
                    firstName: true,
                    lastName: true,
                    specialization: true,
                    department: true,
                },
            },
            appointment: {
                columns: {
                    appointmentDate: true,
                    appointmentTime: true,
                    appointmentType: true,
                },
            },
            prescriptions: {
                columns: {
                    medicationName: true,
                    dosage: true,
                    frequency: true,
                    duration: true,
                    instructions: true,
                },
            },
        },
    });
};

export const getMedicalRecordByIdService = async (recordId: string) => {
    const record = await db.query.medicalRecords.findFirst({
        where: eq(medicalRecords.medicalRecordId, recordId),
        with: {
            patient: {
                columns: {
                    firstName: true,
                    lastName: true,
                    dateOfBirth: true,
                    gender: true,
                    insuranceProvider: true,
                    insuranceNumber: true,
                },
                with: {
                    user: {
                        columns: {
                            email: true,
                            phone: true,
                        },
                    },
                },
            },
            doctor: {
                columns: {
                    firstName: true,
                    lastName: true,
                    specialization: true,
                    department: true,
                    licenseNumber: true,
                },
            },
            appointment: {
                columns: {
                    appointmentDate: true,
                    appointmentTime: true,
                    appointmentType: true,
                    appointmentStatus: true,
                    reason: true,
                },
            },
            prescriptions: true,
        },
    });

    return record ?? null;
};

// Write operations stay on core API
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