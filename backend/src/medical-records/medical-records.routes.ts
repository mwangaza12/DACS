import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
    createMedicalRecordController,
    getAllMedicalRecordsController,
    getMedicalRecordByIdController,
    updateMedicalRecordController,
    uploadDocumentController,
} from "./medical-records.controller";

const medicalRecordsRouter = Router();

medicalRecordsRouter.use(authenticate);

medicalRecordsRouter.get("/", getAllMedicalRecordsController);
medicalRecordsRouter.get("/:id", getMedicalRecordByIdController);
medicalRecordsRouter.post("/", authorize("admin", "doctor"), createMedicalRecordController);
medicalRecordsRouter.put("/:id", authorize("admin", "doctor"), updateMedicalRecordController);
medicalRecordsRouter.post("/upload", uploadDocumentController);

export default medicalRecordsRouter;