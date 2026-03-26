import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
    getAllDoctorsController,
    getDoctorAvailabilityController,
    getDoctorByIdController,
    updateDoctorAvailabilityController,
} from "./doctors.controller";

const doctorsRouter = Router();

doctorsRouter.use(authenticate);

doctorsRouter.get("/", getAllDoctorsController);
doctorsRouter.get("/:id", getDoctorByIdController);
doctorsRouter.get("/:id/availability", getDoctorAvailabilityController);
doctorsRouter.put("/:id/availability", authorize("admin", "doctor"), updateDoctorAvailabilityController);

export default doctorsRouter;