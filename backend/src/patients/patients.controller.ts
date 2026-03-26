import { Request, Response } from "express";
import { success } from "../utils/response.handler";
import { UpdatePatientSchema } from "./patients.dto";
import {
    getAllPatientsService,
    getPatientByIdService,
    getPatientMedicalRecordsService,
    updatePatientService,
} from "./patients.service";

export const getAllPatientsController = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const patients = await getAllPatientsService(page, limit);
    return success(res, patients, "Patients retrieved successfully");
};

export const getPatientByIdController = async (req: Request, res: Response) => {
    const {id}  = req.params;
    const patient = await getPatientByIdService(String(id));
    if (!patient) throw new Error("Patient not found");
    return success(res, patient, "Patient retrieved successfully");
};

export const updatePatientController = async (req: Request, res: Response) => {
    const {id}  = req.params;
    const parsed = UpdatePatientSchema.safeParse(req.body);
    if (parsed.error) throw new Error(parsed.error.message);

    const updated = await updatePatientService(String(id), parsed.data);
    if (!updated) throw new Error("Patient not found");
    return success(res, updated, "Patient updated successfully");
};

export const getPatientMedicalRecordsController = async (req: Request, res: Response) => {
    const {id}  = req.params;
    const records = await getPatientMedicalRecordsService(String(id));
    return success(res, records, "Medical records retrieved successfully");
};