import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { doctors, doctorAvailability } from "../db/schema";
import z from "zod";

export const SelectDoctorSchema = createSelectSchema(doctors);
export const InsertDoctorSchema = createInsertSchema(doctors);
export const UpdateDoctorSchema = InsertDoctorSchema.partial().omit({ doctorId: true });

export const SelectAvailabilitySchema = createSelectSchema(doctorAvailability);
export const InsertAvailabilitySchema = createInsertSchema(doctorAvailability).omit({ doctorAvailabilityId: true });
export const UpdateAvailabilitySchema = InsertAvailabilitySchema.partial();

export type SelectDoctorType = z.infer<typeof SelectDoctorSchema>;
export type UpdateDoctorType = z.infer<typeof UpdateDoctorSchema>;
export type InsertAvailabilityType = z.infer<typeof InsertAvailabilitySchema>;
export type UpdateAvailabilityType = z.infer<typeof UpdateAvailabilitySchema>;