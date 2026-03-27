import express from "express";
import type { Response } from "express";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import { logger } from "./middlewares/logger";
import { errorHandler } from "./middlewares/error.handler";
import authRouter from "./auth/auth.routes";
import patientsRouter from "./patients/patients.routes";
import doctorsRouter from "./doctors/doctors.routes";
import appointmentsRouter from "./appointments/appointments.routes";
import medicalRecordsRouter from "./medical-records/medical-records.routes";
import billingRouter from "./billing/billing.routes";
import reportsRouter from "./reports/reports.routes";
import notificationsRouter from "./notifications/notifications.routes";
import cors from "cors"

dotenv.config();

const PORT = process.env.PORT || 5000;

export const db = drizzle({ connection: process.env.DATABASE_URL!, casing: 'snake_case'});

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/doctors", doctorsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/medical-records", medicalRecordsRouter);
app.use("/api/bills", billingRouter);
app.use("/api", reportsRouter);
app.use("/api/notifications", notificationsRouter);

// Health check 
app.get("/", (_req, res: Response) => {
    res.json({
        appName: "Doctor Appointment Computer System",
        developer: "Joseph Mwangaza",
        version: "1.0.0",
        status: "running",
    });
});

// 404 Handler ─
app.use((_req, res: Response) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler (Express 5 — catches all async throws) ─
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`DACS running on http://localhost:${PORT}`);
});