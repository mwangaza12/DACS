export type UserRole = "patient" | "doctor" | "admin";
export type Gender = "male" | "female" | "other";
export type AppointmentStatus = "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show" | "rescheduled";
export type AppointmentType = "regular" | "follow_up" | "emergency" | "consultation" | "procedure";
export type BillStatus = "pending" | "paid" | "partially_paid" | "insurance_pending" | "written_off";
export type NotificationType = "sms" | "email" | "push" | "in_app";
export type NotificationStatus = "pending" | "sent" | "failed" | "delivered";
export type DayOfWeek = "0" | "1" | "2" | "3" | "4" | "5" | "6";

// ── Base entities ─────────────────────────────────────────────────────────────

export interface User {
  userId: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PatientProfile {
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  nationalId?: string | null;
  insuranceProvider?: string | null;
  insuranceNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  address?: string | null;
}

export interface DoctorProfile {
  doctorId: string;
  firstName: string;
  lastName: string;
  specialization?: string | null;
  licenseNumber?: string | null;
  department?: string | null;
  consultationFee?: string | null;
}

export interface DoctorAvailability {
  doctorAvailabilityId: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

export interface Appointment {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  endTime: string;
  appointmentStatus: AppointmentStatus;
  appointmentType: AppointmentType;
  reason?: string | null;
  notes?: string | null;
  cancellationReason?: string | null;
  reminderSent: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface MedicalRecord {
  medicalRecordId: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  recordDate: string;
  diagnosis?: string | null;
  symptoms?: string | null;
  prescription?: string | null;
  notes?: string | null;
  followUpDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Prescription {
  prescriptionId: string;
  medicalRecordId: string;
  medicationName: string;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  instructions?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PatientDocument {
  patientDocumentId: string;
  patientId: string;
  uploadedBy: string;
  documentType?: string | null;
  fileName?: string | null;
  filePath?: string | null;
  uploadedAt: string;
}

export interface Bill {
  billId: string;
  appointmentId: string;
  patientId: string;
  amount?: string | null;
  insuranceCovered?: string | null;
  patientPayable: string;
  billStatus: BillStatus;
  paymentMethod?: string | null;
  paymentDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface InsuranceClaim {
  insuranceClaimId: string;
  billId: string;
  claimNumber?: string | null;
  insuranceProvider?: string | null;
  amountClaimed?: string | null;
  amountApproved?: string | null;
  status: string;
  submittedDate?: string | null;
  approvedDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Notification {
  notificationId: string;
  userId: string;
  appointmentId?: string | null;
  notificationType: NotificationType;
  subject?: string | null;
  message?: string | null;
  notificationsStatus: NotificationStatus;
  sentAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

// ── Relational / enriched shapes (what the API actually returns) ──────────────

export interface PatientWithUser extends PatientProfile {
  user: Pick<User, "email" | "phone" | "isActive">;
}

export interface PatientFull extends PatientWithUser {
  appointments: Pick<Appointment,
    | "appointmentId"
    | "appointmentDate"
    | "appointmentTime"
    | "appointmentStatus"
    | "appointmentType"
  >[];
  documents: Pick<PatientDocument,
    | "patientDocumentId"
    | "documentType"
    | "fileName"
    | "uploadedAt"
  >[];
  bills: Pick<Bill,
    | "billId"
    | "amount"
    | "patientPayable"
    | "billStatus"
    | "paymentDate"
  >[];
}

export interface DoctorWithUser extends DoctorProfile {
  user: Pick<User, "email" | "phone" | "isActive">;
  availability: Pick<DoctorAvailability,
    | "dayOfWeek"
    | "startTime"
    | "endTime"
    | "slotDuration"
  >[];
}

export interface DoctorFull extends DoctorWithUser {
  appointments: Pick<Appointment,
    | "appointmentId"
    | "appointmentDate"
    | "appointmentTime"
    | "appointmentStatus"
    | "appointmentType"
  >[];
}

export interface AppointmentWithRelations extends Appointment {
  patient: PatientWithUser;
  doctor: Pick<DoctorProfile,
    | "firstName"
    | "lastName"
    | "consultationFee"
  >;
  bill?: Bill | null;
  history?: AppointmentHistory[];
}

export interface AppointmentHistory {
  appointmentHistoryId: string;
  appointmentId: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  changedBy?: string | null;
  changeReason?: string | null;
  changedAt: string;
}

export interface MedicalRecordWithRelations extends MedicalRecord {
  patient: Pick<PatientProfile,
    | "firstName"
    | "lastName"
    | "dateOfBirth"
    | "gender"
    | "insuranceProvider"
    | "insuranceNumber"
  > & {
    user: Pick<User, "email" | "phone">;
  };
  doctor: Pick<DoctorProfile,
    | "firstName"
    | "lastName"
    | "specialization"
    | "department"
    | "licenseNumber"
  >;
  appointment: Pick<Appointment,
    | "appointmentDate"
    | "appointmentTime"
    | "appointmentType"
    | "appointmentStatus"
    | "reason"
  >;
  prescriptions: Prescription[];
}

export interface BillWithRelations extends Bill {
  patient: Pick<PatientProfile, "firstName" | "lastName"> & {
    user: Pick<User, "email" | "phone">;
  };
  appointment: Pick<Appointment,
    | "appointmentDate"
    | "appointmentTime"
    | "appointmentType"
    | "appointmentStatus"
  >;
  insuranceClaims: InsuranceClaim[];
}

export interface BillFull extends BillWithRelations {
  appointment: Pick<Appointment,
    | "appointmentDate"
    | "appointmentTime"
    | "appointmentType"
    | "appointmentStatus"
  > & {
    doctor: Pick<DoctorProfile, "firstName" | "lastName" | "department">;
  };
}

export interface InsuranceClaimWithRelations extends InsuranceClaim {
  bill: Pick<Bill,
    | "amount"
    | "insuranceCovered"
    | "patientPayable"
    | "billStatus"
  > & {
    patient: Pick<PatientProfile, "firstName" | "lastName">;
    appointment: Pick<Appointment, "appointmentDate" | "appointmentType">;
  };
}

export interface NotificationWithRelations extends Notification {
  appointment?: Pick<Appointment,
    | "appointmentDate"
    | "appointmentTime"
    | "appointmentType"
    | "appointmentStatus"
  > | null;
}

export interface DoctorAvailabilityWithDoctor extends DoctorAvailability {
  doctor: Pick<DoctorProfile,
    | "firstName"
    | "lastName"
    | "specialization"
    | "department"
  >;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  profile: PatientProfile | DoctorProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// ── Inputs ────────────────────────────────────────────────────────────────────

export interface RegisterPatientInput {
  role: "patient";
  email: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  nationalId?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
}

export interface RegisterDoctorInput {
  role: "doctor";
  email: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  licenseNumber?: string;
  department?: string;
  consultationFee?: string;
}

export interface RegisterAdminInput {
  role: "admin";
  email: string;
  phone?: string;
  password: string;
}

export type RegisterInput = RegisterPatientInput | RegisterDoctorInput | RegisterAdminInput;

export interface LoginInput {
  email: string;
  password: string;
}