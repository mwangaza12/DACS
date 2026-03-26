import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
    getAllPatientsController,
    getPatientByIdController,
    getPatientMedicalRecordsController,
    updatePatientController,
} from "./patients.controller";

const patientsRouter = Router();

patientsRouter.use(authenticate);

patientsRouter.get("/", authorize("admin", "doctor"), getAllPatientsController);
patientsRouter.get("/:id", getPatientByIdController);
patientsRouter.put("/:id", updatePatientController);
patientsRouter.get("/:id/records", getPatientMedicalRecordsController);

export default patientsRouter;