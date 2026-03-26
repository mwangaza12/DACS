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

export type SelectBillType = z.infer<typeof SelectBillSchema>;
export type InsertBillType = z.infer<typeof InsertBillSchema>;
export type PayBillType = z.infer<typeof PayBillSchema>;