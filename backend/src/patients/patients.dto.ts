import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { patients } from "../db/schema";
import z from "zod";

export const SelectPatientSchema = createSelectSchema(patients);
export const InsertPatientSchema = createInsertSchema(patients);
export const UpdatePatientSchema = InsertPatientSchema.partial().omit({ patientId: true });

export type SelectPatientType = z.infer<typeof SelectPatientSchema>;
export type InsertPatientType = z.infer<typeof InsertPatientSchema>;
export type UpdatePatientType = z.infer<typeof UpdatePatientSchema>;