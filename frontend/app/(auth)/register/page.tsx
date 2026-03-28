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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";

type Step = "role" | "credentials" | "profile";

const ROLE_OPTIONS: { role: UserRole; icon: React.ReactNode; title: string; desc: string }[] = [
  {
    role: "patient",
    icon: <User className="h-5 w-5" />,
    title: "Patient",
    desc: "Book appointments, view your medical records and bills",
  },
  {
    role: "doctor",
    icon: <Stethoscope className="h-5 w-5" />,
    title: "Doctor",
    desc: "Manage your schedule, patients and consultations",
  },
  {
    role: "admin",
    icon: <UserCog className="h-5 w-5" />,
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

  const isDoctor = selectedRole === "doctor";
  const pErrors = patientForm.formState.errors;
  const dErrors = doctorForm.formState.errors;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep("credentials");
  };

  const handleCredentialsNext = async () => {
    const fields = ["email", "password", "confirmPassword"] as const;
    const valid = isDoctor
      ? await doctorForm.trigger(fields)
      : await patientForm.trigger(fields);
    if (valid) setStep("profile");
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
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
        <Card className="w-full max-w-md animate-fade-up">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Create account</CardTitle>
            <CardDescription>
              Join DACS — your clinic's healthcare platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step progress */}
            <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300",
                    i < stepIndex && "bg-primary/20 text-primary border border-primary/30",
                    i === stepIndex && "bg-primary text-primary-foreground shadow-md",
                    i > stepIndex && "bg-accent text-muted-foreground border border-border",
                  )}>
                    <span className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                      i < stepIndex && "bg-primary/30",
                      i === stepIndex && "bg-white/20",
                      i > stepIndex && "bg-border",
                    )}>
                      {i < stepIndex ? "✓" : i + 1}
                    </span>
                    {s}
                  </div>
                  {i < steps.length - 1 && (
                    <ChevronRight size={12} className="text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>

            {serverError && (
              <div className="mb-5 p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 animate-fade-in">
                <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                </div>
                <p className="text-sm text-red-400">{serverError}</p>
              </div>
            )}

            {/* STEP 1 — Role */}
            {step === "role" && (
              <div className="flex flex-col gap-3 animate-fade-in">
                {ROLE_OPTIONS.map(({ role, icon, title, desc }) => (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border text-left",
                      "transition-all duration-300 cursor-pointer group hover:scale-105",
                      "bg-card border-border hover:border-primary/50 hover:bg-accent",
                    )}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary/20 transition-all duration-300">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm text-foreground mb-0.5">{title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                    <ArrowRight size={15} className="text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            )}

            {/* STEP 2 — Credentials */}
            {step === "credentials" && (
              <div className="flex flex-col gap-4 animate-fade-in">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@clinic.com"
                      className={cn(
                        "pl-9 transition-all duration-300",
                        (isDoctor ? dErrors.email : pErrors.email) && "border-red-500 focus-visible:ring-red-500"
                      )}
                      {...(isDoctor ? doctorForm.register("email") : patientForm.register("email"))}
                    />
                  </div>
                  {(isDoctor ? dErrors.email?.message : pErrors.email?.message) && (
                    <p className="text-sm text-red-500 animate-fade-in">{isDoctor ? dErrors.email?.message : pErrors.email?.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254 700 000 000"
                      className="pl-9 transition-all duration-300"
                      {...(isDoctor ? doctorForm.register("phone") : patientForm.register("phone"))}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      className={cn(
                        "pl-9 pr-9 transition-all duration-300",
                        (isDoctor ? dErrors.password : pErrors.password) && "border-red-500 focus-visible:ring-red-500"
                      )}
                      {...(isDoctor ? doctorForm.register("password") : patientForm.register("password"))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-300"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {(isDoctor ? dErrors.password?.message : pErrors.password?.message) && (
                    <p className="text-sm text-red-500 animate-fade-in">{isDoctor ? dErrors.password?.message : pErrors.password?.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your password"
                      className={cn(
                        "pl-9 pr-9 transition-all duration-300",
                        (isDoctor ? dErrors.confirmPassword : pErrors.confirmPassword) && "border-red-500 focus-visible:ring-red-500"
                      )}
                      {...(isDoctor ? doctorForm.register("confirmPassword") : patientForm.register("confirmPassword"))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-300"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {(isDoctor ? dErrors.confirmPassword?.message : pErrors.confirmPassword?.message) && (
                    <p className="text-sm text-red-500 animate-fade-in">{isDoctor ? dErrors.confirmPassword?.message : pErrors.confirmPassword?.message}</p>
                  )}
                </div>

                <div className="flex gap-3 mt-2">
                  <Button variant="outline" onClick={() => setStep("role")} className="flex-1 transition-all duration-300 hover:scale-105">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  {selectedRole === "admin" ? (
                    <Button 
                      className="flex-1 font-semibold transition-all duration-300 hover:scale-105" 
                      disabled={patientForm.formState.isSubmitting}
                      onClick={submitAdmin}
                    >
                      {patientForm.formState.isSubmitting ? "Creating..." : "Create account"}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button className="flex-1 font-semibold transition-all duration-300 hover:scale-105" onClick={handleCredentialsNext}>
                      Continue
                      <ArrowRight className="h-4 w-4 ml-1" />
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
                  <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="flex flex-col gap-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            placeholder="John"
                            className={cn("pl-9 transition-all duration-300", pErrors.firstName && "border-red-500 focus-visible:ring-red-500")}
                            {...patientForm.register("firstName")}
                          />
                        </div>
                        {pErrors.firstName?.message && <p className="text-sm text-red-500 animate-fade-in">{pErrors.firstName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          className={cn("transition-all duration-300", pErrors.lastName && "border-red-500 focus-visible:ring-red-500")}
                          {...patientForm.register("lastName")}
                        />
                        {pErrors.lastName?.message && <p className="text-sm text-red-500 animate-fade-in">{pErrors.lastName.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        className={cn("transition-all duration-300", pErrors.dateOfBirth && "border-red-500 focus-visible:ring-red-500")}
                        {...patientForm.register("dateOfBirth")}
                      />
                      {pErrors.dateOfBirth?.message && <p className="text-sm text-red-500 animate-fade-in">{pErrors.dateOfBirth.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        onValueChange={(value) => patientForm.setValue("gender", value as "male" | "female" | "other")}
                      >
                        <SelectTrigger className={cn("transition-all duration-300", pErrors.gender && "border-red-500 focus-visible:ring-red-500")}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {pErrors.gender?.message && <p className="text-sm text-red-500 animate-fade-in">{pErrors.gender.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nationalId">National ID</Label>
                      <Input
                        id="nationalId"
                        placeholder="12345678"
                        className="transition-all duration-300"
                        {...patientForm.register("nationalId")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insuranceProvider">Insurance provider (optional)</Label>
                      <Input
                        id="insuranceProvider"
                        placeholder="AAR Health, NHIF…"
                        className="transition-all duration-300"
                        {...patientForm.register("insuranceProvider")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address (optional)</Label>
                      <Input
                        id="address"
                        placeholder="123 Ngong Road, Nairobi"
                        className="transition-all duration-300"
                        {...patientForm.register("address")}
                      />
                    </div>

                    <div className="flex gap-3 mt-2">
                      <Button variant="outline" onClick={() => setStep("credentials")} className="flex-1 transition-all duration-300 hover:scale-105">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                      </Button>
                      <Button type="submit" disabled={patientForm.formState.isSubmitting} className="flex-1 font-semibold transition-all duration-300 hover:scale-105">
                        {patientForm.formState.isSubmitting ? "Creating..." : "Create account"}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* Doctor */}
                {selectedRole === "doctor" && (
                  <form onSubmit={doctorForm.handleSubmit(onDoctorSubmit)} className="flex flex-col gap-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            placeholder="Sarah"
                            className={cn("pl-9 transition-all duration-300", dErrors.firstName && "border-red-500 focus-visible:ring-red-500")}
                            {...doctorForm.register("firstName")}
                          />
                        </div>
                        {dErrors.firstName?.message && <p className="text-sm text-red-500 animate-fade-in">{dErrors.firstName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          placeholder="Kimani"
                          className={cn("transition-all duration-300", dErrors.lastName && "border-red-500 focus-visible:ring-red-500")}
                          {...doctorForm.register("lastName")}
                        />
                        {dErrors.lastName?.message && <p className="text-sm text-red-500 animate-fade-in">{dErrors.lastName.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <div className="relative">
                        <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="specialization"
                          placeholder="Cardiology, General Practice…"
                          className="pl-9 transition-all duration-300"
                          {...doctorForm.register("specialization")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License number</Label>
                      <Input
                        id="licenseNumber"
                        placeholder="KMD-2024-001"
                        className="transition-all duration-300"
                        {...doctorForm.register("licenseNumber")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        placeholder="Internal Medicine"
                        className="transition-all duration-300"
                        {...doctorForm.register("department")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consultationFee">Consultation fee (KES)</Label>
                      <Input
                        id="consultationFee"
                        type="number"
                        placeholder="2500"
                        className="transition-all duration-300"
                        {...doctorForm.register("consultationFee")}
                      />
                      <p className="text-xs text-muted-foreground">Patients will see this when booking</p>
                    </div>

                    <div className="flex gap-3 mt-2">
                      <Button variant="outline" onClick={() => setStep("credentials")} className="flex-1 transition-all duration-300 hover:scale-105">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                      </Button>
                      <Button type="submit" disabled={doctorForm.formState.isSubmitting} className="flex-1 font-semibold transition-all duration-300 hover:scale-105">
                        {doctorForm.formState.isSubmitting ? "Creating..." : "Create account"}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}

            <p className="text-center text-sm text-muted-foreground mt-7 animate-fade-in">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-all duration-300 hover:scale-105 inline-block">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <FooterSection />
    </>
  );
}