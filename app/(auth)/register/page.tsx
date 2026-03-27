"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight,
  ArrowLeft, Stethoscope, UserCog, ChevronRight,
} from "lucide-react";
import {
  registerPatientSchema,
  registerDoctorSchema,
  RegisterPatientFormData,
  RegisterDoctorFormData,
} from "@/lib/schemas";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";

type Step = "role" | "credentials" | "profile";

const ROLE_OPTIONS: { role: UserRole; icon: React.ReactNode; title: string; desc: string }[] = [
  {
    role: "patient",
    icon: <User size={20} />,
    title: "Patient",
    desc: "Book appointments, view your medical records and bills",
  },
  {
    role: "doctor",
    icon: <Stethoscope size={20} />,
    title: "Doctor",
    desc: "Manage your schedule, patients and consultations",
  },
  {
    role: "admin",
    icon: <UserCog size={20} />,
    title: "Administrator",
    desc: "Full access to manage the clinic, staff and reports",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const patientForm = useForm<RegisterPatientFormData>({
    resolver: zodResolver(registerPatientSchema),
    defaultValues: { role: "patient" },
  });

  const doctorForm = useForm<RegisterDoctorFormData>({
    resolver: zodResolver(registerDoctorSchema),
    defaultValues: { role: "doctor" },
  });

  // Use the correct form based on role
  const isDoctor = selectedRole === "doctor";
  const pErrors = patientForm.formState.errors;
  const dErrors = doctorForm.formState.errors;
  const isSubmitting = isDoctor
    ? doctorForm.formState.isSubmitting
    : patientForm.formState.isSubmitting;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep("credentials");
  };

  const handleCredentialsNext = async () => {
    const fields = ["email", "password", "confirmPassword"] as const;
    const valid = isDoctor
      ? await doctorForm.trigger(fields)
      : await patientForm.trigger(fields);
    if (valid) setStep(selectedRole === "admin" ? "credentials" : "profile");
  };

  const submitAdmin = async () => {
    const email = patientForm.getValues("email");
    const password = patientForm.getValues("password");
    const phone = patientForm.getValues("phone");
    const valid = await patientForm.trigger(["email", "password", "confirmPassword"]);
    if (!valid) return;
    setServerError(null);
    try {
      const res = await authApi.register({ role: "admin", email, phone, password });
      const { user, profile, accessToken, refreshToken } = res.data.data;
      setAuth({ user, profile, accessToken, refreshToken });
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Registration failed.";
      setServerError(message);
    }
  };

  const onPatientSubmit = async (data: RegisterPatientFormData) => {
    setServerError(null);
    try {
      const { confirmPassword: _, ...payload } = data as RegisterPatientFormData & { confirmPassword: string };
      const res = await authApi.register(payload);
      const { user, profile, accessToken, refreshToken } = res.data.data;
      setAuth({ user, profile, accessToken, refreshToken });
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Registration failed.";
      setServerError(message);
    }
  };

  const onDoctorSubmit = async (data: RegisterDoctorFormData) => {
    setServerError(null);
    try {
      const { confirmPassword: _, ...payload } = data as RegisterDoctorFormData & { confirmPassword: string };
      const res = await authApi.register(payload);
      const { user, profile, accessToken, refreshToken } = res.data.data;
      setAuth({ user, profile, accessToken, refreshToken });
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Registration failed.";
      setServerError(message);
    }
  };

  const steps = ["Role", "Account", "Profile"];
  const stepIndex = step === "role" ? 0 : step === "credentials" ? 1 : 2;

  return (
    <div className="animate-fade-up">
      <div className="mb-7">
        <h1 className="font-display font-bold text-3xl text-text-primary mb-2 tracking-tight">
          Create account
        </h1>
        <p className="text-text-secondary text-sm">
          Join DACS — your clinic&apos;s healthcare platform
        </p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium font-body transition-all duration-300",
              i < stepIndex && "bg-primary-500/20 text-primary-400 border border-primary-500/30",
              i === stepIndex && "bg-primary-500 text-white shadow-glow-sm",
              i > stepIndex && "bg-surface text-text-muted border border-border",
            )}>
              <span className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                i < stepIndex && "bg-primary-400/30",
                i === stepIndex && "bg-white/20",
                i > stepIndex && "bg-border",
              )}>
                {i < stepIndex ? "✓" : i + 1}
              </span>
              {s}
            </div>
            {i < steps.length - 1 && (
              <ChevronRight size={12} className="text-text-muted" />
            )}
          </div>
        ))}
      </div>

      {serverError && (
        <div className="mb-5 p-4 rounded-xl bg-red-950/40 border border-danger/30 flex items-start gap-3 animate-fade-in">
          <div className="w-4 h-4 rounded-full bg-danger/20 border border-danger/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-danger" />
          </div>
          <p className="text-sm text-danger/90 font-body">{serverError}</p>
        </div>
      )}

      {/* STEP 1 — Role */}
      {step === "role" && (
        <div className="flex flex-col gap-3 stagger">
          {ROLE_OPTIONS.map(({ role, icon, title, desc }) => (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border text-left",
                "transition-all duration-150 cursor-pointer group",
                "bg-surface border-border animate-fade-up opacity-0",
                "hover:border-primary-500/50 hover:bg-card hover:shadow-card-hover",
              )}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary-500/10 border border-primary-500/20 text-primary-400 group-hover:bg-primary-500/20 transition-all">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm text-text-primary mb-0.5">{title}</p>
                <p className="text-xs text-text-tertiary font-body leading-relaxed">{desc}</p>
              </div>
              <ArrowRight size={15} className="text-text-muted group-hover:text-primary-400 transition-all flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* STEP 2 — Credentials */}
      {step === "credentials" && (
        <div className="flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@clinic.com"
            leftIcon={<Mail size={15} />}
            error={isDoctor ? dErrors.email?.message : pErrors.email?.message}
            {...(isDoctor ? doctorForm.register("email") : patientForm.register("email"))}
          />
          <Input
            label="Phone number"
            type="tel"
            placeholder="+254 700 000 000"
            leftIcon={<Phone size={15} />}
            {...(isDoctor ? doctorForm.register("phone") : patientForm.register("phone"))}
          />
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 6 characters"
            leftIcon={<Lock size={15} />}
            error={isDoctor ? dErrors.password?.message : pErrors.password?.message}
            rightElement={
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer" tabIndex={-1}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            {...(isDoctor ? doctorForm.register("password") : patientForm.register("password"))}
          />
          <Input
            label="Confirm password"
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat your password"
            leftIcon={<Lock size={15} />}
            error={isDoctor ? dErrors.confirmPassword?.message : pErrors.confirmPassword?.message}
            rightElement={
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer" tabIndex={-1}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            {...(isDoctor ? doctorForm.register("confirmPassword") : patientForm.register("confirmPassword"))}
          />

          <div className="flex gap-3 mt-2">
            <Button variant="secondary" onClick={() => setStep("role")} className="flex-1">
              <ArrowLeft size={15} /> Back
            </Button>
            {selectedRole === "admin" ? (
              <Button className="flex-1 font-display font-bold" loading={isSubmitting} onClick={submitAdmin}>
                Create account <ArrowRight size={15} />
              </Button>
            ) : (
              <Button className="flex-1 font-display font-bold" onClick={handleCredentialsNext}>
                Continue <ArrowRight size={15} />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* STEP 3 — Profile */}
      {step === "profile" && (
        <>
          {/* Patient */}
          {selectedRole === "patient" && (
            <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First name" placeholder="John" leftIcon={<User size={15} />}
                  error={pErrors.firstName?.message} {...patientForm.register("firstName")} />
                <Input label="Last name" placeholder="Doe"
                  error={pErrors.lastName?.message} {...patientForm.register("lastName")} />
              </div>
              <Input label="Date of birth" type="date"
                error={pErrors.dateOfBirth?.message} {...patientForm.register("dateOfBirth")} />
              <Select label="Gender" placeholder="Select gender"
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
                error={pErrors.gender?.message} {...patientForm.register("gender")} />
              <Input label="National ID" placeholder="12345678" {...patientForm.register("nationalId")} />
              <Input label="Insurance provider (optional)" placeholder="AAR Health, NHIF…" {...patientForm.register("insuranceProvider")} />
              <Input label="Address (optional)" placeholder="123 Ngong Road, Nairobi" {...patientForm.register("address")} />
              <div className="flex gap-3 mt-2">
                <Button variant="secondary" onClick={() => setStep("credentials")} className="flex-1">
                  <ArrowLeft size={15} /> Back
                </Button>
                <Button type="submit" loading={patientForm.formState.isSubmitting} className="flex-1 font-display font-bold">
                  Create account <ArrowRight size={15} />
                </Button>
              </div>
            </form>
          )}

          {/* Doctor */}
          {selectedRole === "doctor" && (
            <form onSubmit={doctorForm.handleSubmit(onDoctorSubmit)} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First name" placeholder="Sarah" leftIcon={<User size={15} />}
                  error={dErrors.firstName?.message} {...doctorForm.register("firstName")} />
                <Input label="Last name" placeholder="Kimani"
                  error={dErrors.lastName?.message} {...doctorForm.register("lastName")} />
              </div>
              <Input label="Specialization" placeholder="Cardiology, General Practice…"
                leftIcon={<Stethoscope size={15} />} {...doctorForm.register("specialization")} />
              <Input label="License number" placeholder="KMD-2024-001" {...doctorForm.register("licenseNumber")} />
              <Input label="Department" placeholder="Internal Medicine" {...doctorForm.register("department")} />
              <Input label="Consultation fee (KES)" type="number" placeholder="2500"
                hint="Patients will see this when booking"
                {...doctorForm.register("consultationFee")} />
              <div className="flex gap-3 mt-2">
                <Button variant="secondary" onClick={() => setStep("credentials")} className="flex-1">
                  <ArrowLeft size={15} /> Back
                </Button>
                <Button type="submit" loading={doctorForm.formState.isSubmitting} className="flex-1 font-display font-bold">
                  Create account <ArrowRight size={15} />
                </Button>
              </div>
            </form>
          )}
        </>
      )}

      <p className="text-center text-sm text-text-secondary mt-7">
        Already have an account?{" "}
        <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
