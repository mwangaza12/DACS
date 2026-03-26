import { Request, Response } from "express";
import { success } from "../utils/response.handler";
import {
    getAppointmentReportService,
    getDashboardMetricsService,
    getKpiService,
    getNoShowReportService,
    getPatientDemographicsService,
    getRevenueReportService,
} from "./reports.service";

export const getAppointmentReportController = async (req: Request, res: Response) => {
    const { from, to } = req.query as Record<string, string>;
    const data = await getAppointmentReportService(from, to);
    return success(res, data, "Appointment report retrieved");
};

export const getNoShowReportController = async (req: Request, res: Response) => {
    const { from, to } = req.query as Record<string, string>;
    const data = await getNoShowReportService(from, to);
    return success(res, data, "No-show report retrieved");
};

export const getRevenueReportController = async (req: Request, res: Response) => {
    const { from, to } = req.query as Record<string, string>;
    const data = await getRevenueReportService(from, to);
    return success(res, data, "Revenue report retrieved");
};

export const getPatientDemographicsController = async (req: Request, res: Response) => {
    const data = await getPatientDemographicsService();
    return success(res, data, "Patient demographics retrieved");
};

export const getDashboardMetricsController = async (req: Request, res: Response) => {
    const data = await getDashboardMetricsService();
    return success(res, data, "Dashboard metrics retrieved");
};

export const getKpiController = async (req: Request, res: Response) => {
    const data = await getKpiService();
    return success(res, data, "KPIs retrieved");
};