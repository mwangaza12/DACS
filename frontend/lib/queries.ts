import { AvailabilitySlot } from "@/app/(dashboard)/doctors/[id]/page";
import { api } from "./api";

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

export const fetchRevenueReport = async () => {
  const res = await api.get("/reports/revenue");
  return res.data.data as {
    totalRevenue: string;
    totalPaid: string;
    totalInsurance: string;
    billCount: number;
  };
};

export const fetchNoShowReport = async () => {
  const res = await api.get("/reports/no-show");
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
  return res.data.data as Array<{
    appointmentId: string;
    patientId: string;
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    endTime: string;
    appointmentStatus: string;
    appointmentType: string;
    reason: string | null;
    notes: string | null;
    createdAt: string;
  }>;
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const fetchNotifications = async () => {
  const res = await api.get("/notifications", { params: { limit: 5 } });
  return res.data.data as Array<{
    notificationId: string;
    subject: string | null;
    message: string;
    notificationsStatus: string;
    notificationType: string;
    sentAt: string | null;
    createdAt: string;
  }>;
};

// ── Doctors (for booking) ─────────────────────────────────────────────────────
export const fetchDoctors = async (page = 1, limit = 50) => {
  const res = await api.get("/doctors", { params: { page, limit } });
  return res.data.data as Array<{
    doctorId: string;
    firstName: string;
    lastName: string;
    specialization: string | null;
    department: string | null;
    consultationFee: string | null;
  }>;
};

export const fetchDoctorAvailability = async (doctorId: string) => {
  const res = await api.get(`/doctors/${doctorId}/availability`);
  return res.data.data as Array<{
    doctorAvailabilityId: string;
    doctorId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDuration: number;
    isActive: boolean;
  }>;
};

export const fetchDoctorById =  async (doctorId: string) => {
  const res = await api.get(`/doctors/${doctorId}`);
  return res.data.data as Array<{
    doctorId: string;
    firstName: string;
    lastName: string;
    specialization: string | null;
    department: string | null;
    consultationFee: string | null;
  }>;
}

export const updateDoctorAvailability =  async (doctorId: string, data: AvailabilitySlot[]) => {
  const res = await api.put(`/doctors/${doctorId}/availability`, data);
  return res.data.data;
}

export const fetchAvailableSlots = async (doctorId: string, date: string) => {
  const res = await api.get("/appointments/available-slots", { params: { doctorId, date } });
  return res.data.data as string[];
};

export const fetchAppointmentById = async (id: string) => {
  const res = await api.get(`/appointments/${id}`);
  return res.data.data as {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    endTime: string;
    appointmentStatus: string;
    appointmentType: string;
    reason: string | null;
    notes: string | null;
    cancellationReason: string | null;
    reminderSent: boolean;
    createdAt: string;
    updatedAt: string | null;
  };
};

// ── Mutations ─────────────────────────────────────────────────────────────────
export const createAppointment = async (data: {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  endTime: string;
  appointmentType: string;
  reason?: string;
  notes?: string;
}) => {
  const res = await api.post("/appointments", data);
  return res.data.data;
};

export const updateAppointment = async (id: string, data: Record<string, unknown>) => {
  const res = await api.put(`/appointments/${id}`, data);
  return res.data.data;
};

export const cancelAppointment = async (id: string, reason?: string) => {
  const res = await api.delete(`/appointments/${id}`, { data: { reason } });
  return res.data.data;
};

// ── Patients (for admin/doctor views) ────────────────────────────────────────
export const fetchPatients = async (page = 1, limit = 20) => {
  const res = await api.get("/patients", { params: { page, limit } });
  return res.data.data as Array<{
    patientId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    insuranceProvider: string | null;
    insuranceNumber: string | null;
    nationalId: string | null;
    address: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
  }>;
};

export const fetchPatientById = async (id: string) => {
  const res = await api.get(`/patients/${id}`);
  return res.data.data;
};

// ── Medical records ───────────────────────────────────────────────────────────
export const fetchMedicalRecords = async (patientId?: string, page = 1, limit = 20) => {
  const res = await api.get("/medical-records", { params: { patientId, page, limit } });
  return res.data.data as Array<{
    medicalRecordId: string;
    patientId: string;
    doctorId: string;
    appointmentId: string | null;
    recordDate: string;
    diagnosis: string | null;
    symptoms: string | null;
    prescription: string | null;
    notes: string | null;
    followUpDate: string | null;
    createdAt: string;
  }>;
};

export const fetchMedicalRecordById = async (id: string) => {
  const res = await api.get(`/medical-records/${id}`);
  return res.data.data;
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
  return res.data.data;
};

export const updateMedicalRecord = async (id: string, data: Record<string, unknown>) => {
  const res = await api.put(`/medical-records/${id}`, data);
  return res.data.data;
};

// ── Billing ───────────────────────────────────────────────────────────────────
export const fetchBills = async (patientId?: string, page = 1, limit = 20) => {
  const res = await api.get("/bills", { params: { patientId, page, limit } });
  return res.data.data as Array<{
    billId: string;
    appointmentId: string | null;
    patientId: string;
    amount: string | null;
    insuranceCovered: string | null;
    patientPayable: string;
    billStatus: string;
    paymentMethod: string | null;
    paymentDate: string | null;
    createdAt: string;
  }>;
};

export const fetchBillById = async (id: string) => {
  const res = await api.get(`/bills/${id}`);
  return res.data.data;
};

export const payBill = async (id: string, data: { paymentMethod: string; amount: number }) => {
  const res = await api.post(`/bills/${id}/pay`, data);
  return res.data.data;
};

export const updateBill = async (id: string, data: { insuranceCovered?: string; billStatus?: string }) => {
  const res = await api.put(`/bills/${id}`, data);
  return res.data.data;
};

export const fetchInsuranceClaims = async () => {
  const res = await api.get("/bills/insurance-claims");
  return res.data.data;
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const fetchAllNotifications = async (page = 1, limit = 30) => {
  const res = await api.get("/notifications", { params: { page, limit } });
  return res.data.data as Array<{
    notificationId: string;
    userId: string;
    appointmentId: string | null;
    notificationType: string;
    subject: string | null;
    message: string;
    notificationsStatus: string;
    sentAt: string | null;
    createdAt: string;
  }>;
};

export const markNotificationRead = async (id: string) => {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data.data;
};