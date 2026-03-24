import { integer } from "drizzle-orm/pg-core";
import { inet } from "drizzle-orm/pg-core";
import { time } from "drizzle-orm/pg-core";
import { decimal } from "drizzle-orm/pg-core";
import { timestamp, uuid, pgTable, pgEnum, boolean, varchar,text, date } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("role", ["patient", "admin", "doctor"]);
export const genderEnum = pgEnum("gender", ["male","female","other"]);
export const dayOfWeekEnum = pgEnum("dayOfWeek", ["0","1","2","3","4","5","6"]);
export const appointmentStatusEnum = pgEnum("appointmentStatus", ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']);
export const appointmentTypeEnum = pgEnum("appointmentType", ['regular', 'follow_up', 'emergency', 'consultation', 'procedure']);
export const billStatusEnum = pgEnum("billStatus", ['pending', 'paid', 'partially_paid', 'insurance_pending', 'written_off']);
export const notificationTypeEnum = pgEnum("notificationType", ['sms', 'email', 'push', 'in_app']);
export const notificationsStatusEnum = pgEnum("notificationsStatus", ['pending', 'sent', 'failed', 'delivered'])

const timestamps = {
    updated_at: timestamp(),
    created_at: timestamp().defaultNow().notNull(),
}

export const users = pgTable("users",{
    userId: uuid().primaryKey().defaultRandom(),
    email: varchar({length: 255}).notNull().unique(),
    phone: varchar({length: 20}),
    password: varchar({length: 255}).notNull(),
    role: userRoleEnum().notNull().default("patient"),
    isActive: boolean().default(true).notNull(),
    ...timestamps
});

export const patients = pgTable("patients", {
    patientId: uuid().primaryKey().references(() => users.userId),
    firstName: varchar({length: 255}).notNull(),
    lastName: varchar({length: 255}).notNull(),
    dateOfBirth: date().notNull(),
    gender: genderEnum().notNull(),
    nationalId: varchar({length: 50}),
    insuranceProvider: varchar({length:100}),
    insuranceNumber: varchar({length:100}),
    emergencyContactName: varchar({length:200}),
    emergencyContactPhone: varchar({length:20}),
    address: text(),
});

export const doctors = pgTable("doctors", {
    doctorId: uuid().primaryKey().references(()=> users.userId),
    firstName: varchar({length: 255}).notNull(),
    lastName: varchar({length: 255}).notNull(),
    specialization: varchar({length:100}),
    licenseNumber: varchar({length:50}),
    department: varchar({length: 100}),
    consultationFee: decimal({precision: 10, scale: 2}),
    ...timestamps
});

export const doctorAvailability = pgTable("doctor_availability", {
    doctorAvailabilityId: uuid().primaryKey().defaultRandom(),
    doctorId: uuid().references(()=> doctors.doctorId),
    dayOfWeek: dayOfWeekEnum(),
    startTime: time().notNull(),
    endTime: time().notNull(),
    slotDuration: integer().default(30),
    isActive: boolean().default(true),
    ...timestamps
})

export const appointments = pgTable("appointments", {
    appointmentId: uuid().primaryKey().defaultRandom(),
    patientId: uuid().references(()=> patients.patientId),
    doctorId: uuid().references(()=> doctors.doctorId),
    appointmentDate: date().notNull(),
    appointmentTime: time().notNull(),
    endTime: time().notNull(),
    appointmentStatus: appointmentStatusEnum().default("scheduled"),
    appointmentType: appointmentTypeEnum().default('regular'),
    reason: text(),
    notes: text(),
    cancellationReason: text(),
    reminderSent: boolean().default(false),
    ...timestamps
});

export const appointmentHistory = pgTable("appointment_history", {
    appointmentHistoryId: uuid().primaryKey().defaultRandom(),
    appointmentId: uuid().references(()=> appointments.appointmentId),
    previousStatus: varchar({length:20}),
    newStatus: varchar({length:20}),
    changedBy: uuid().references(()=> users.userId),
    changeReason: text(),
    changedAt: timestamp().defaultNow()
});

export const medicalRecords = pgTable("medical_records", {
    medicalRecordId: uuid().primaryKey().defaultRandom(),
    patientId: uuid().references(()=> patients.patientId),
    doctorId: uuid().references(()=> doctors.doctorId),
    appointmentId: uuid().references(()=> appointments.appointmentId),
    recordDate: date().notNull(),
    diagnosis: text(),
    symptoms: text(),
    prescription: text(),
    notes: text(),
    followUpDate: date(),
    ...timestamps
});

export const prescriptions = pgTable("prescriptions", {
    prescriptionId: uuid().primaryKey().defaultRandom(),
    medicalRecordId: uuid().references(()=> medicalRecords.medicalRecordId),
    medicationName: varchar({length: 255}).notNull(),
    dosage: varchar({length: 100}),
    frequency: varchar({length: 100}),
    duration: varchar({length: 100}),
    instructions: text(),
    ...timestamps
});

export const patientDocuments = pgTable("patient_documents", {
    patientDocumentId: uuid().primaryKey().defaultRandom(),
    patientId: uuid().references(()=> patients.patientId),
    uploadedBy: uuid().references(()=> users.userId),
    documentType: varchar({length: 50}),
    fileName: varchar({length: 255}),
    file_path: varchar({length: 500}),
    uploadedAt: timestamp().defaultNow()
})

export const bills = pgTable("bills", {
    billId: uuid().primaryKey().defaultRandom(),
    appointmentId: uuid().references(()=> appointments.appointmentId),
    patientId: uuid().references(()=> patients.patientId),
    amount: decimal({precision:10, scale: 2}),
    insuranceCovered: decimal({precision: 10, scale: 2}).default("0"),
    patientPayable: decimal({precision: 10,scale: 2}).notNull(),
    billStatus: billStatusEnum().default("pending"),
    paymentMethod: varchar({length: 50}),
    paymentDate: timestamp(),
    ...timestamps
});

export const insuranceClaims = pgTable("insurance_claims", {
    insuranceClaimId: uuid().primaryKey().defaultRandom(),
    billId: uuid().references(()=> bills.billId),
    claimNumber: varchar({length: 100}),
    insuranceProvider: varchar({length: 100}),
    amountClaimed: decimal({precision: 10, scale: 2}),
    amountApproved: decimal({precision: 10, scale: 2}),
    status: varchar({length: 20}).default("submitted"),
    submittedDate: date(),
    approvedDate: date(),
    ...timestamps
});

export const notifications = pgTable("notifications", {
    notificationId: uuid().primaryKey().defaultRandom(),
    userId: uuid().references(()=> users.userId),
    appointmentId: uuid().references(() => appointments.appointmentId),
    notificationType: notificationTypeEnum().default('email'),
    subject: varchar({length:255}),
    message: text(),
    notificationsStatus: notificationsStatusEnum().default("pending"),
    sentAt: timestamp(),
    ...timestamps
});

export const activityLogs = pgTable("activity_logs",{
    activityLogId: uuid().primaryKey().defaultRandom(),
    userId: uuid().references(() => users.userId),
    action: varchar({length: 100}),
    entityType: varchar({length: 50}),
    entityId: uuid(),
    ipAddress: inet(),
    userAgent: text(),
    ...timestamps
});

export const systemMetrics = pgTable("system_metrics", {
    systemMetricId: uuid().primaryKey().defaultRandom(),
    metricName: varchar({length: 100}),
    metricValue: decimal({precision: 10, scale: 2}),
    recordedAt: timestamp().defaultNow()
});