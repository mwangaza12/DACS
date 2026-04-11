import { eq } from "drizzle-orm";
import { db } from "..";
import { patients } from "../db/schema";
import { UpdatePatientType } from "./patients.dto";
import { paginate } from "../utils/pagination";

export const getAllPatientsService = async (page = 1, limit = 10) => {
    const { limit: lim, offset } = paginate(page, limit);

    return db.query.patients.findMany({
        limit: lim,
        offset,
        with: {
            user: {
                columns: {
                    email: true,
                    phone: true,
                    isActive: true,
                },
            },
        },
    });
};

export const getPatientByIdService = async (patientId: string) => {
    const patient = await db.query.patients.findFirst({
        where: eq(patients.patientId, patientId),
        with: {
            user: {
                columns: {
                    email: true,
                    phone: true,
                    isActive: true,
                },
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
            documents: {
                columns: {
                    patientDocumentId: true,
                    documentType: true,
                    fileName: true,
                    uploadedAt: true,
                },
            },
            bills: {
                columns: {
                    billId: true,
                    amount: true,
                    patientPayable: true,
                    billStatus: true,
                    paymentDate: true,
                },
                limit: 5,
            },
        },
    });

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
    const patient = await db.query.patients.findFirst({
        where: eq(patients.patientId, patientId),
        columns: {},
        with: {
            medicalRecords: {
                with: {
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
            },
        },
    });

    return patient?.medicalRecords ?? [];
};