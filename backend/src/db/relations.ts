import { relations } from "drizzle-orm";
import {
  users, patients, doctors, doctorAvailability, appointments,
  appointmentHistory, medicalRecords, prescriptions, patientDocuments,
  bills, insuranceClaims, notifications, activityLogs, passwordResetTokens,
} from "./schema"; // adjust path as needed

// User Relations
export const userRelations = relations(users, ({ one, many }) => ({
  patient: one(patients, {
    fields: [users.userId],
    references: [patients.patientId],
  }),
  doctor: one(doctors, {
    fields: [users.userId],
    references: [doctors.doctorId],
  }),
  appointmentHistoryChanges: many(appointmentHistory),
  uploadedDocuments: many(patientDocuments),
  notifications: many(notifications),
  activityLogs: many(activityLogs),
  passwordResetTokens: many(passwordResetTokens),
}));

// Patient Relations
export const patientRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.patientId],
    references: [users.userId],
  }),
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
  documents: many(patientDocuments),
  bills: many(bills),
}));

// Doctor Relations
export const doctorRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.doctorId],
    references: [users.userId],
  }),
  availability: many(doctorAvailability),
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
}));

// Doctor Availability Relations
export const doctorAvailabilityRelations = relations(doctorAvailability, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorAvailability.doctorId],
    references: [doctors.doctorId],
  }),
}));

// Appointment Relations
export const appointmentRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.patientId],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.doctorId],
  }),
  history: many(appointmentHistory),
  medicalRecord: one(medicalRecords, {
    fields: [appointments.appointmentId],
    references: [medicalRecords.appointmentId],
  }),
  bill: one(bills, {
    fields: [appointments.appointmentId],
    references: [bills.appointmentId],
  }),
  notifications: many(notifications),
}));

// Appointment History Relations
export const appointmentHistoryRelations = relations(appointmentHistory, ({ one }) => ({
  appointment: one(appointments, {
    fields: [appointmentHistory.appointmentId],
    references: [appointments.appointmentId],
  }),
  changedBy: one(users, {
    fields: [appointmentHistory.changedBy],
    references: [users.userId],
  }),
}));

// Medical Record Relations
export const medicalRecordRelations = relations(medicalRecords, ({ one, many }) => ({
  patient: one(patients, {
    fields: [medicalRecords.patientId],
    references: [patients.patientId],
  }),
  doctor: one(doctors, {
    fields: [medicalRecords.doctorId],
    references: [doctors.doctorId],
  }),
  appointment: one(appointments, {
    fields: [medicalRecords.appointmentId],
    references: [appointments.appointmentId],
  }),
  prescriptions: many(prescriptions),
}));

// Prescription Relations
export const prescriptionRelations = relations(prescriptions, ({ one }) => ({
  medicalRecord: one(medicalRecords, {
    fields: [prescriptions.medicalRecordId],
    references: [medicalRecords.medicalRecordId],
  }),
}));

// Patient Document Relations
export const patientDocumentRelations = relations(patientDocuments, ({ one }) => ({
  patient: one(patients, {
    fields: [patientDocuments.patientId],
    references: [patients.patientId],
  }),
  uploadedBy: one(users, {
    fields: [patientDocuments.uploadedBy],
    references: [users.userId],
  }),
}));

// Bill Relations
export const billRelations = relations(bills, ({ one, many }) => ({
  appointment: one(appointments, {
    fields: [bills.appointmentId],
    references: [appointments.appointmentId],
  }),
  patient: one(patients, {
    fields: [bills.patientId],
    references: [patients.patientId],
  }),
  insuranceClaims: many(insuranceClaims),
}));

// Insurance Claim Relations
export const insuranceClaimRelations = relations(insuranceClaims, ({ one }) => ({
  bill: one(bills, {
    fields: [insuranceClaims.billId],
    references: [bills.billId],
  }),
}));

// Notification Relations
export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.userId],
  }),
  appointment: one(appointments, {
    fields: [notifications.appointmentId],
    references: [appointments.appointmentId],
  }),
}));

// Activity Log Relations
export const activityLogRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.userId],
  }),
}));

// Password Reset Token Relations
export const passwordResetTokenRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.userId],
  }),
}));