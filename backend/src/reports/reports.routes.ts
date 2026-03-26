import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
    getAppointmentReportController,
    getDashboardMetricsController,
    getKpiController,
    getNoShowReportController,
    getPatientDemographicsController,
    getRevenueReportController,
} from "./reports.controller";

const reportsRouter = Router();

reportsRouter.use(authenticate, authorize("admin", "doctor"));

reportsRouter.get("/reports/appointments", getAppointmentReportController);
reportsRouter.get("/reports/no-show", getNoShowReportController);
reportsRouter.get("/reports/revenue", getRevenueReportController);
reportsRouter.get("/reports/patient-demographics", getPatientDemographicsController);
reportsRouter.get("/dashboard/metrics", getDashboardMetricsController);
reportsRouter.get("/dashboard/kpi", getKpiController);

export default reportsRouter;