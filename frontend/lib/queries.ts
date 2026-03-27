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