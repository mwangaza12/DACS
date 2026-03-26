import { Request, Response } from "express";
import { success } from "../utils/response.handler";
import { UpdateAvailabilitySchema } from "./doctors.dto";
import z from "zod";
import {
    getAllDoctorsService,
    getDoctorAvailabilityService,
    getDoctorByIdService,
    upsertDoctorAvailabilityService,
} from "./doctors.service";

export const getAllDoctorsController = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const doctors = await getAllDoctorsService(page, limit);
    return success(res, doctors, "Doctors retrieved successfully");
};

export const getDoctorByIdController = async (req: Request, res: Response) => {
    const id = String(req.params);
    const doctor = await getDoctorByIdService(id);
    if (!doctor) throw new Error("Doctor not found");
    return success(res, doctor, "Doctor retrieved successfully");
};

export const getDoctorAvailabilityController = async (req: Request, res: Response) => {
    const id = String(req.params);
    const availability = await getDoctorAvailabilityService(id);
    return success(res, availability, "Availability retrieved successfully");
};

export const updateDoctorAvailabilityController = async (req: Request, res: Response) => {
    const id = String(req.params);
    const parsed = z.array(UpdateAvailabilitySchema).safeParse(req.body);
    if (parsed.error) throw new Error(parsed.error.message);

    const updated = await upsertDoctorAvailabilityService(id, parsed.data);
    return success(res, updated, "Availability updated successfully");
};