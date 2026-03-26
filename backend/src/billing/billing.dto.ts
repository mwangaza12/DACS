import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { bills, insuranceClaims } from "../db/schema";
import z from "zod";

export const SelectBillSchema = createSelectSchema(bills);
export const InsertBillSchema = createInsertSchema(bills).omit({ billId: true });

export const SelectInsuranceClaimSchema = createSelectSchema(insuranceClaims);

export const PayBillSchema = z.object({
    paymentMethod: z.string().min(1),
    amount: z.number().positive(),
});

export const UpdateBillSchema = z.object({
    insuranceCovered: z.string().optional(),   // decimal as string e.g. "1500.00"
    billStatus: z.enum(["pending","paid","partially_paid","insurance_pending","written_off"]).optional(),
    notes: z.string().optional(),
});

export type SelectBillType = z.infer<typeof SelectBillSchema>;
export type InsertBillType = z.infer<typeof InsertBillSchema>;
export type PayBillType = z.infer<typeof PayBillSchema>;
export type UpdateBillType = z.infer<typeof UpdateBillSchema>;