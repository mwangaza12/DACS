import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "..";
import { appointments, bills, patients, systemMetrics } from "../db/schema";

export const getAppointmentReportService = async (from?: string, to?: string) => {
    const conditions = [];
    if (from) conditions.push(gte(appointments.appointmentDate, from));
    if (to) conditions.push(lte(appointments.appointmentDate, to));

    const query = db
        .select({
            status: appointments.appointmentStatus,
            total: count(),
        })
        .from(appointments)
        .groupBy(appointments.appointmentStatus);

    if (conditions.length) query.where(and(...conditions));
    return query;
};

export const getNoShowReportService = async (from?: string, to?: string) => {
    const conditions = [eq(appointments.appointmentStatus, "no_show")];
    if (from) conditions.push(gte(appointments.appointmentDate, from));
    if (to) conditions.push(lte(appointments.appointmentDate, to));

    const [result] = await db
        .select({ noShows: count() })
        .from(appointments)
        .where(and(...conditions));

    const [total] = await db.select({ total: count() }).from(appointments);

    const noShowCount = Number(result?.noShows ?? 0);
    const totalCount = Number(total?.total ?? 0);

    return {
        noShows: noShowCount,
        total: totalCount,
        rate: totalCount > 0 ? ((noShowCount / totalCount) * 100).toFixed(2) + "%" : "0%",
    };
};

export const getRevenueReportService = async (from?: string, to?: string) => {
    const conditions = [eq(bills.billStatus, "paid")];

    const query = db
        .select({
            totalRevenue: sql<string>`SUM(${bills.amount})`,
            totalPaid: sql<string>`SUM(${bills.patientPayable})`,
            totalInsurance: sql<string>`SUM(${bills.insuranceCovered})`,
            billCount: count(),
        })
        .from(bills)
        .where(and(...conditions));

    const [result] = await query;
    return result;
};

export const getPatientDemographicsService = async () => {
    const byGender = await db
        .select({ gender: patients.gender, total: count() })
        .from(patients)
        .groupBy(patients.gender);

    return { byGender };
};

export const getDashboardMetricsService = async () => {
    const [totalPatients] = await db.select({ count: count() }).from(patients);
    const [totalAppointments] = await db.select({ count: count() }).from(appointments);
    const [pendingBills] = await db
        .select({ count: count() })
        .from(bills)
        .where(eq(bills.billStatus, "pending"));
    const [todayAppointments] = await db
        .select({ count: count() })
        .from(appointments)
        .where(eq(appointments.appointmentDate, new Date().toISOString().split("T")[0]));

    return {
        totalPatients: totalPatients?.count ?? 0,
        totalAppointments: totalAppointments?.count ?? 0,
        pendingBills: pendingBills?.count ?? 0,
        todayAppointments: todayAppointments?.count ?? 0,
    };
};

export const getKpiService = async () => {
    return db.select().from(systemMetrics).orderBy(systemMetrics.recordedAt).limit(20);
};