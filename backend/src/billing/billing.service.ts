import { and, eq } from "drizzle-orm";
import { db } from "..";
import { bills, insuranceClaims } from "../db/schema";
import { PayBillType, UpdateBillType } from "./billing.dto";
import { paginate } from "../utils/pagination";

export const getAllBillsService = async (patientId?: string, page = 1, limit = 10) => {
    const { limit: lim, offset } = paginate(page, limit);

    return db.query.bills.findMany({
        where: patientId ? eq(bills.patientId, patientId) : undefined,
        limit: lim,
        offset,
        with: {
            patient: {
                columns: {
                    firstName: true,
                    lastName: true,
                },
                with: {
                    user: {
                        columns: { email: true, phone: true },
                    },
                },
            },
            appointment: {
                columns: {
                    appointmentDate: true,
                    appointmentTime: true,
                    appointmentType: true,
                    appointmentStatus: true,
                },
            },
            insuranceClaims: true,
        },
    });
};

export const getBillByIdService = async (billId: string) => {
    const bill = await db.query.bills.findFirst({
        where: eq(bills.billId, billId),
        with: {
            patient: {
                columns: {
                    firstName: true,
                    lastName: true,
                },
                with: {
                    user: {
                        columns: { email: true, phone: true },
                    },
                },
            },
            appointment: {
                columns: {
                    appointmentDate: true,
                    appointmentTime: true,
                    appointmentType: true,
                    appointmentStatus: true,
                },
                with: {
                    doctor: {
                        columns: {
                            firstName: true,
                            lastName: true,
                            department: true,
                        },
                    },
                },
            },
            insuranceClaims: true,
        },
    });

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

    return db.query.insuranceClaims.findMany({
        limit: lim,
        offset,
        with: {
            bill: {
                columns: {
                    amount: true,
                    insuranceCovered: true,
                    patientPayable: true,
                    billStatus: true,
                },
                with: {
                    patient: {
                        columns: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                    appointment: {
                        columns: {
                            appointmentDate: true,
                            appointmentType: true,
                        },
                    },
                },
            },
        },
    });
};