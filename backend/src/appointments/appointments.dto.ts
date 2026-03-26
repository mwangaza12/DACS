import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { appointments } from "../db/schema";
import z from "zod";

export const SelectAppointmentSchema = createSelectSchema(appointments);
export const InsertAppointmentSchema = createInsertSchema(appointments).omit({ appointmentId: true });
export const UpdateAppointmentSchema = InsertAppointmentSchema.partial();

export const AvailableSlotsQuerySchema = z.object({
    doctorId: z.string().uuid(),
    date: z.string(),
});

export type SelectAppointmentType = z.infer<typeof SelectAppointmentSchema>;
export type InsertAppointmentType = z.infer<typeof InsertAppointmentSchema>;
export type UpdateAppointmentType = z.infer<typeof UpdateAppointmentSchema>;