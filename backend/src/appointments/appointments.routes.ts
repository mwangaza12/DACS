import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
    cancelAppointmentController,
    createAppointmentController,
    getAllAppointmentsController,
    getAppointmentByIdController,
    getAvailableSlotsController,
    updateAppointmentController,
} from "./appointments.controller";

const appointmentsRouter = Router();

appointmentsRouter.use(authenticate);

// NOTE: /available-slots must come before /:id to avoid route conflict
appointmentsRouter.get("/available-slots", getAvailableSlotsController);
appointmentsRouter.get("/", getAllAppointmentsController);
appointmentsRouter.get("/:id", getAppointmentByIdController);
appointmentsRouter.post("/", createAppointmentController);
appointmentsRouter.put("/:id", updateAppointmentController);
appointmentsRouter.delete("/:id", authorize("admin", "doctor", "patient"), cancelAppointmentController);

export default appointmentsRouter;