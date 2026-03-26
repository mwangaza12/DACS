import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { medicalRecords, patientDocuments } from "../db/schema";
import z from "zod";

export const SelectMedicalRecordSchema = createSelectSchema(medicalRecords);
export const InsertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({ medicalRecordId: true });
export const UpdateMedicalRecordSchema = InsertMedicalRecordSchema.partial();

export const SelectPatientDocumentSchema = createSelectSchema(patientDocuments);
export const InsertPatientDocumentSchema = createInsertSchema(patientDocuments).omit({ patientDocumentId: true });

export type SelectMedicalRecordType = z.infer<typeof SelectMedicalRecordSchema>;
export type InsertMedicalRecordType = z.infer<typeof InsertMedicalRecordSchema>;
export type UpdateMedicalRecordType = z.infer<typeof UpdateMedicalRecordSchema>;
export type InsertPatientDocumentType = z.infer<typeof InsertPatientDocumentSchema>;