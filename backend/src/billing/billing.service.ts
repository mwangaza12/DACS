import { and, eq } from "drizzle-orm";
import { db } from "..";
import { bills, insuranceClaims } from "../db/schema";
import { PayBillType, UpdateBillType } from "./billing.dto";
import { paginate } from "../utils/pagination";

export const getAllBillsService = async (patientId?: string, page = 1, limit = 10) => {
    const { limit: lim, offset } = paginate(page, limit);

    // Build conditions array the same way appointments.service does
    // so the .where() call is only made when there is actually a filter
    const conditions = [];
    if (patientId) conditions.push(eq(bills.patientId, patientId));

    const query = db.select().from(bills);
    if (conditions.length > 0) query.where(and(...conditions));

    return query.limit(lim).offset(offset);
};

export const getBillByIdService = async (billId: string) => {
    const [bill] = await db.select().from(bills).where(eq(bills.billId, billId));
    return bill ?? null;
};

export const updateBillService = async (billId: string, data: UpdateBillType) => {
    const bill = await getBillByIdService(billId);
    if (!bill) throw new Error("Bill not found");

    const insuranceCovered = data.insuranceCovered ?? bill.insuranceCovered ?? "0";
    const totalAmount = parseFloat(bill.amount ?? "0");
    const covered = parseFloat(insuranceCovered);
    const patientPayable = Math.max(0, totalAmount - covered).toFixed(2);

    const [updated] = await db
        .update(bills)
        .set({
            insuranceCovered,
            patientPayable,
            ...(data.billStatus ? { billStatus: data.billStatus } : {}),
            updated_at: new Date(),
        })
        .where(eq(bills.billId, billId))
        .returning();

    return updated ?? null;
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
    const { limit: lim, offset } = paginate(page, limit);
    return db.select().from(insuranceClaims).limit(lim).offset(offset);
};