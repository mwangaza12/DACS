import { Request, Response } from "express";
import { success } from "../utils/response.handler";
import { PayBillSchema } from "./billing.dto";
import {
    getAllBillsService,
    getBillByIdService,
    getInsuranceClaimsService,
    processPaymentService,
} from "./billing.service";

export const getAllBillsController = async (req: Request, res: Response) => {
    const { patientId, page, limit } = req.query as Record<string, string>;
    const bills = await getAllBillsService(patientId, Number(page) || 1, Number(limit) || 10);
    return success(res, bills, "Bills retrieved successfully");
};

export const getBillByIdController = async (req: Request, res: Response) => {
    const id = String(req.params);
    const bill = await getBillByIdService(id);
    if (!bill) throw new Error("Bill not found");
    return success(res, bill, "Bill retrieved successfully");
};

export const processPaymentController = async (req: Request, res: Response) => {
    const id = String(req.params);
    const parsed = PayBillSchema.safeParse(req.body);
    if (parsed.error) throw new Error(parsed.error.message);

    const updated = await processPaymentService(id, parsed.data);
    return success(res, updated, "Payment processed successfully");
};

export const getInsuranceClaimsController = async (req: Request, res: Response) => {
    const { page, limit } = req.query as Record<string, string>;
    const claims = await getInsuranceClaimsService(Number(page) || 1, Number(limit) || 10);
    return success(res, claims, "Insurance claims retrieved successfully");
};