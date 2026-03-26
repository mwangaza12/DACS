import { Request, Response } from "express";
import { success } from "../utils/response.handler";
import {
    AvailableSlotsQuerySchema,
    InsertAppointmentSchema,
    UpdateAppointmentSchema,
} from "./appointments.dto";
import {
    cancelAppointmentService,
    createAppointmentService,
    getAllAppointmentsService,
    getAppointmentByIdService,
    getAvailableSlotsService,
    updateAppointmentService,
} from "./appointments.service";

export const getAllAppointmentsController = async (req: Request, res: Response) => {
    const { patientId, doctorId, status, page, limit } = req.query as Record<string, string>;
    const data = await getAllAppointmentsService({
        patientId,
        doctorId,
        status,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
    });
    return success(res, data, "Appointments retrieved successfully");
};

export const getAppointmentByIdController = async (req: Request, res: Response) => {
    const id = String(req.params);
    const appointment = await getAppointmentByIdService(id);
    if (!appointment) throw new Error("Appointment not found");
    return success(res, appointment, "Appointment retrieved successfully");
};

export const createAppointmentController = async (req: Request, res: Response) => {
    const parsed = InsertAppointmentSchema.safeParse(req.body);
    if (parsed.error) throw new Error(parsed.error.message);

    const appointment = await createAppointmentService(parsed.data);
    return success(res, appointment, "Appointment created successfully", 201);
};

export const updateAppointmentController = async (req: Request, res: Response) => {
    const id = String(req.params);
    const parsed = UpdateAppointmentSchema.safeParse(req.body);
    if (parsed.error) throw new Error(parsed.error.message);

    const updated = await updateAppointmentService(id, parsed.data);
    if (!updated) throw new Error("Appointment not found");
    return success(res, updated, "Appointment updated successfully");
};

export const cancelAppointmentController = async (req: Request, res: Response) => {
    const id = String(req.params);
    const { reason } = req.body;

    const cancelled = await cancelAppointmentService(id, reason);
    if (!cancelled) throw new Error("Appointment not found");
    return success(res, cancelled, "Appointment cancelled successfully");
};

export const getAvailableSlotsController = async (req: Request, res: Response) => {
    const parsed = AvailableSlotsQuerySchema.safeParse(req.query);
    if (parsed.error) throw new Error(parsed.error.message);

    const slots = await getAvailableSlotsService(parsed.data.doctorId, parsed.data.date);
    return success(res, slots, "Available slots retrieved successfully");
};