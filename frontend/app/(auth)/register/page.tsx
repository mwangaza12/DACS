"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight,
  ArrowLeft, ChevronRight,
} from "lucide-react";
import {
  registerPatientSchema,
  RegisterPatientFormData,
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
import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";

// Only two steps now — no role selection step
type Step = "credentials" | "profile";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState<Step>("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const patientForm = useForm<RegisterPatientFormData>({
    resolver: zodResolver(registerPatientSchema),
    defaultValues: { role: "patient" },
  });

  const pErrors = patientForm.formState.errors;

  const handleCredentialsNext = async () => {
    const valid = await patientForm.trigger(["email", "password", "confirmPassword"]);
    if (valid) setStep("profile");
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

  const steps = ["Account", "Profile"];
  const stepIndex = step === "credentials" ? 0 : 1;

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

            {/* STEP 1 — Credentials */}
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
                      placeholder="you@example.com"
                      className={cn(
                        "pl-9 transition-all duration-300",
                        pErrors.email && "border-red-500 focus-visible:ring-red-500"
                      )}
                      {...patientForm.register("email")}
                    />
                  </div>
                  {pErrors.email?.message && (
                    <p className="text-sm text-red-500 animate-fade-in">{pErrors.email.message}</p>
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
                      {...patientForm.register("phone")}
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
                        pErrors.password && "border-red-500 focus-visible:ring-red-500"
                      )}
                      {...patientForm.register("password")}
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
                  {pErrors.password?.message && (
                    <p className="text-sm text-red-500 animate-fade-in">{pErrors.password.message}</p>
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
                        pErrors.confirmPassword && "border-red-500 focus-visible:ring-red-500"
                      )}
                      {...patientForm.register("confirmPassword")}
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
                  {pErrors.confirmPassword?.message && (
                    <p className="text-sm text-red-500 animate-fade-in">{pErrors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  className="w-full font-semibold transition-all duration-300 hover:scale-105 mt-2"
                  onClick={handleCredentialsNext}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}

            {/* STEP 2 — Patient Profile */}
            {step === "profile" && (
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("credentials")}
                    className="flex-1 transition-all duration-300 hover:scale-105"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={patientForm.formState.isSubmitting}
                    className="flex-1 font-semibold transition-all duration-300 hover:scale-105"
                  >
                    {patientForm.formState.isSubmitting ? "Creating..." : "Create account"}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </form>
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