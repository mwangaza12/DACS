import { eq } from "drizzle-orm";
import { db } from "..";
import { bills, insuranceClaims } from "../db/schema";
import { PayBillType } from "./billing.dto";

export const getAllBillsService = async (patientId?: string, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const query = db.select().from(bills);
    if (patientId) query.where(eq(bills.patientId, patientId));
    return query.limit(limit).offset(offset);
};

export const getBillByIdService = async (billId: string) => {
    const [bill] = await db.select().from(bills).where(eq(bills.billId, billId));
    return bill ?? null;
};

export const processPaymentService = async (billId: string, data: PayBillType) => {
    const bill = await getBillByIdService(billId);
    if (!bill) throw new Error("Bill not found");
    if (bill.billStatus === "paid") throw new Error("Bill is already paid");

    const [updated] = await db
        .update(bills)
        .set({
            billStatus: "paid",
            paymentMethod: data.paymentMethod,
            paymentDate: new Date(),
            updated_at: new Date(),
        })
        .where(eq(bills.billId, billId))
        .returning();

    return updated;
};

export const getInsuranceClaimsService = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return db.select().from(insuranceClaims).limit(limit).offset(offset);
};