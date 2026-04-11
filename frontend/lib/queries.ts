import { AvailabilitySlot } from "@/app/(dashboard)/doctors/[id]/page";
import { api } from "./api";
import type {
  AppointmentWithRelations,
  AppointmentType,
  AppointmentStatus,
  BillWithRelations,
  BillFull,
  InsuranceClaimWithRelations,
  DoctorWithUser,
  DoctorFull,
  DoctorAvailabilityWithDoctor,
  PatientWithUser,
  PatientFull,
  MedicalRecordWithRelations,
  NotificationWithRelations,
} from "@/types";

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const fetchDashboardMetrics = async () => {
  const res = await api.get("/dashboard/metrics");
  return res.data.data as {
    totalPatients: number;
    totalAppointments: number;
    pendingBills: number;
    todayAppointments: number;
  };
};

export const fetchKpis = async () => {
  const res = await api.get("/dashboard/kpi");
  return res.data.data as Array<{
    systemMetricId: string;
    metricName: string;
    metricValue: string;
    recordedAt: string;
  }>;
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const fetchAppointmentReport = async (from?: string, to?: string) => {
  const res = await api.get("/reports/appointments", { params: { from, to } });
  return res.data.data as Array<{ status: string; total: number }>;
};

export const fetchRevenueReport = async (from?: string, to?: string) => {
  const res = await api.get("/reports/revenue", { params: { from, to } });
  return res.data.data as {
    totalRevenue: string | null;
    totalPaid: string | null;
    totalInsurance: string | null;
    billCount: number;
  };
};

export const fetchNoShowReport = async (from?: string, to?: string) => {
  const res = await api.get("/reports/no-show", { params: { from, to } });
  return res.data.data as {
    noShows: number;
    total: number;
    rate: string;
  };
};

export const fetchPatientDemographics = async () => {
  const res = await api.get("/reports/patient-demographics");
  return res.data.data as {
    byGender: Array<{ gender: string; total: number }>;
  };
};

// ── Appointments ──────────────────────────────────────────────────────────────

export const fetchAppointments = async (params?: {
  page?: number;
  limit?: number;
  patientId?: string;
  doctorId?: string;
  status?: string;
}) => {
  const res = await api.get("/appointments", { params });
  return res.data.data as AppointmentWithRelations[];
};

export const fetchAppointmentById = async (id: string) => {
  const res = await api.get(`/appointments/${id}`);
  return res.data.data as AppointmentWithRelations;
};

export const fetchAvailableSlots = async (doctorId: string, date: string) => {
  const res = await api.get("/appointments/available-slots", { params: { doctorId, date } });
  return res.data.data as string[];
};

export const createAppointment = async (data: {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  endTime: string;
  appointmentType: AppointmentType;
  reason?: string;
  notes?: string;
}) => {
  const res = await api.post("/appointments", data);
  return res.data.data as AppointmentWithRelations;
};

export const updateAppointment = async (
  id: string,
  data: Partial<{
    appointmentStatus: AppointmentStatus;
    appointmentType: AppointmentType;
    appointmentDate: string;
    appointmentTime: string;
    endTime: string;
    reason: string;
    notes: string;
  }>
) => {
  const res = await api.put(`/appointments/${id}`, data);
  return res.data.data as AppointmentWithRelations;
};

export const cancelAppointment = async (id: string, reason?: string) => {
  const res = await api.delete(`/appointments/${id}`, { data: { reason } });
  return res.data.data as AppointmentWithRelations;
};

// ── Doctors ───────────────────────────────────────────────────────────────────

export const fetchDoctors = async (page = 1, limit = 50) => {
  const res = await api.get("/doctors", { params: { page, limit } });
  return res.data.data as DoctorWithUser[];
};

export const fetchDoctorById = async (doctorId: string) => {
  const res = await api.get(`/doctors/${doctorId}`);
  return res.data.data as DoctorFull;
};

export const fetchDoctorAvailability = async (doctorId: string) => {
  const res = await api.get(`/doctors/${doctorId}/availability`);
  return res.data.data as DoctorAvailabilityWithDoctor[];
};

export const updateDoctorAvailability = async (doctorId: string, data: AvailabilitySlot[]) => {
  const res = await api.put(`/doctors/${doctorId}/availability`, data);
  return res.data.data as DoctorAvailabilityWithDoctor[];
};

// ── Patients ──────────────────────────────────────────────────────────────────

export const fetchPatients = async (page = 1, limit = 20) => {
  const res = await api.get("/patients", { params: { page, limit } });
  return res.data.data as PatientWithUser[];
};

export const fetchPatientById = async (id: string) => {
  const res = await api.get(`/patients/${id}`);
  return res.data.data as PatientFull;
};

// ── Medical records ───────────────────────────────────────────────────────────

export const fetchMedicalRecords = async (patientId?: string, page = 1, limit = 20) => {
  const res = await api.get("/medical-records", { params: { patientId, page, limit } });
  return res.data.data as MedicalRecordWithRelations[];
};

export const fetchMedicalRecordById = async (id: string) => {
  const res = await api.get(`/medical-records/${id}`);
  return res.data.data as MedicalRecordWithRelations;
};

export const createMedicalRecord = async (data: {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  recordDate: string;
  diagnosis?: string;
  symptoms?: string;
  prescription?: string;
  notes?: string;
  followUpDate?: string;
}) => {
  const res = await api.post("/medical-records", data);
  return res.data.data as MedicalRecordWithRelations;
};

export const updateMedicalRecord = async (
  id: string,
  data: Partial<{
    diagnosis: string;
    symptoms: string;
    prescription: string;
    notes: string;
    followUpDate: string;
  }>
) => {
  const res = await api.put(`/medical-records/${id}`, data);
  return res.data.data as MedicalRecordWithRelations;
};

// ── Billing ───────────────────────────────────────────────────────────────────

export const fetchBills = async (patientId?: string, page = 1, limit = 20) => {
  const res = await api.get("/bills", { params: { patientId, page, limit } });
  return res.data.data as BillWithRelations[];
};

export const fetchBillById = async (id: string) => {
  const res = await api.get(`/bills/${id}`);
  return res.data.data as BillFull;
};

export const payBill = async (id: string, data: { paymentMethod: string; amount: number }) => {
  const res = await api.post(`/bills/${id}/pay`, data);
  return res.data.data as BillFull;
};

export const updateBill = async (
  id: string,
  data: Partial<{ insuranceCovered: string; billStatus: string }>
) => {
  const res = await api.put(`/bills/${id}`, data);
  return res.data.data as BillFull;
};

export const fetchInsuranceClaims = async (page = 1, limit = 20) => {
  const res = await api.get("/bills/insurance-claims", { params: { page, limit } });
  return res.data.data as InsuranceClaimWithRelations[];
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const fetchNotifications = async () => {
  const res = await api.get("/notifications", { params: { limit: 5 } });
  return res.data.data as NotificationWithRelations[];
};

export const fetchAllNotifications = async (page = 1, limit = 30) => {
  const res = await api.get("/notifications", { params: { page, limit } });
  return res.data.data as NotificationWithRelations[];
};

export const markNotificationRead = async (id: string) => {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data.data as NotificationWithRelations;
};