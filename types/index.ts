export type UserRole = "patient" | "doctor" | "admin";

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
  gender: "male" | "female" | "other";
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

export interface RegisterPatientInput {
  role: "patient";
  email: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
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
