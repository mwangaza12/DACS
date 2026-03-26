import { Request, Response } from "express";
import { success } from "../utils/response.handler";
import { InsertMedicalRecordSchema, UpdateMedicalRecordSchema } from "./medical-records.dto";
import {
    createMedicalRecordService,
    getAllMedicalRecordsService,
    getMedicalRecordByIdService,
    updateMedicalRecordService,
    uploadPatientDocumentService,
} from "./medical-records.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getAllMedicalRecordsController = async (req: Request, res: Response) => {
    const { patientId, page, limit } = req.query as Record<string, string>;
    const records = await getAllMedicalRecordsService(patientId, Number(page) || 1, Number(limit) || 10);
    return success(res, records, "Medical records retrieved successfully");
};

export const getMedicalRecordByIdController = async (req: Request, res: Response) => {
    const {id}  = req.params;
    const record = await getMedicalRecordByIdService(String(id));
    if (!record) throw new Error("Medical record not found");
    return success(res, record, "Medical record retrieved successfully");
};

export const createMedicalRecordController = async (req: Request, res: Response) => {
    const parsed = InsertMedicalRecordSchema.safeParse(req.body);
    if (parsed.error) throw new Error(parsed.error.message);

    const record = await createMedicalRecordService(parsed.data);
    return success(res, record, "Medical record created successfully", 201);
};

export const updateMedicalRecordController = async (req: Request, res: Response) => {
    const {id}  = req.params;
    const parsed = UpdateMedicalRecordSchema.safeParse(req.body);
    if (parsed.error) throw new Error(parsed.error.message);

    const updated = await updateMedicalRecordService(String(id), parsed.data);
    if (!updated) throw new Error("Medical record not found");
    return success(res, updated, "Medical record updated successfully");
};

export const uploadDocumentController = async (req: AuthRequest, res: Response) => {
    const { patientId, documentType, fileName, filePath } = req.body;

    if (!patientId || !fileName || !filePath) {
        throw new Error("patientId, fileName, and filePath are required");
    }

    const doc = await uploadPatientDocumentService({
        patientId,
        uploadedBy: req.user!.userId,
        documentType,
        fileName,
        file_path: filePath,
    });

    return success(res, doc, "Document uploaded successfully", 201);
};