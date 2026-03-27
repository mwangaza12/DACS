import express from "express";
import type { Response } from "express";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
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

dotenv.config();

// Environment validation
const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET", "JWT_REFRESH_SECRET"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
    console.error(`[STARTUP] Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
}

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim());

// Database
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { casing: "snake_case" });

// App
const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
}));

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many authentication attempts, please try again later." },
});

app.use(globalLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(logger);

// Routes
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/doctors", doctorsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/medical-records", medicalRecordsRouter);
app.use("/api/bills", billingRouter);
app.use("/api", reportsRouter);
app.use("/api/notifications", notificationsRouter);

app.get("/", (_req, res: Response) => {
    res.json({
        appName: "Doctor Appointment Computer System",
        developer: "Joseph Mwangaza",
        version: "1.0.0",
        status: "running",
        environment: NODE_ENV,
    });
});

app.get("/health", (_req, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((_req, res: Response) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`[DACS] Running on http://localhost:${PORT} (${NODE_ENV})`);
    console.log(`[DACS] CORS allowed origins: ${allowedOrigins.join(", ")}`);
});