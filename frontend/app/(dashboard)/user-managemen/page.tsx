"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Plus, Stethoscope, UserCog, X, Eye, EyeOff,
  Mail, Lock, Phone, User, Search, Shield,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Doctor {
  doctorId: string;
  firstName: string;
  lastName: string;
  specialization?: string | null;
  department?: string | null;
  licenseNumber?: string | null;
  consultationFee?: string | number | null;
}

// ── Schemas ────────────────────────────────────────────────────────────────────

const addDoctorSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    specialization: z.string().optional(),
    licenseNumber: z.string().optional(),
    department: z.string().optional(),
    consultationFee: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const addAdminSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type AddDoctorFormData = z.infer<typeof addDoctorSchema>;
type AddAdminFormData = z.infer<typeof addAdminSchema>;
type ModalType = "doctor" | "admin" | null;

// ── API helpers ────────────────────────────────────────────────────────────────

const fetchSystemUsers = async (): Promise<{ doctors: Doctor[] }> => {
  const doctorsRes = await api.get("/doctors?limit=500");
  return {
    doctors: (doctorsRes.data?.data?.doctors ?? doctorsRes.data?.data ?? []) as Doctor[],
  };
};

const registerUser = async (payload: Record<string, unknown>) => {
  const res = await api.post("/auth/register", payload);
  return res.data;
};

// ── Subcomponents ─────────────────────────────────────────────────────────────

function PasswordField({
  id,
  label,
  placeholder,
  error,
  registration,
}: {
  id: string;
  label: string;
  placeholder?: string;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registration: any;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder ?? "Min. 6 characters"}
          className={cn("pl-9 pr-9 transition-all duration-300", error && "border-red-500 focus-visible:ring-red-500")}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-300"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ── Add Doctor Modal ──────────────────────────────────────────────────────────

function AddDoctorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddDoctorFormData>({ resolver: zodResolver(addDoctorSchema) });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-users"] });
      reset();
      setServerError(null);
      onClose();
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create doctor account.";
      setServerError(message);
    },
  });

  const onSubmit = async (data: AddDoctorFormData) => {
    setServerError(null);
    const { confirmPassword: _, ...payload } = data;
    mutation.mutate({ role: "doctor", ...payload });
  };

  const handleClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-teal-400" />
            </div>
            Add Doctor
          </DialogTitle>
          <DialogDescription>
            Create a new doctor account. They will receive a welcome email.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
            <p className="text-sm text-red-400">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="d-firstName">First name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="d-firstName"
                  placeholder="Sarah"
                  className={cn("pl-9", errors.firstName && "border-red-500")}
                  {...register("firstName")}
                />
              </div>
              {errors.firstName?.message && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-lastName">Last name</Label>
              <Input
                id="d-lastName"
                placeholder="Kimani"
                className={cn(errors.lastName && "border-red-500")}
                {...register("lastName")}
              />
              {errors.lastName?.message && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="d-email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="d-email"
                type="email"
                placeholder="doctor@clinic.com"
                className={cn("pl-9", errors.email && "border-red-500")}
                {...register("email")}
              />
            </div>
            {errors.email?.message && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="d-phone">Phone (optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="d-phone" type="tel" placeholder="+254 700 000 000" className="pl-9" {...register("phone")} />
            </div>
          </div>

          {/* Passwords */}
          <PasswordField
            id="d-password"
            label="Password"
            error={errors.password?.message}
            registration={register("password")}
          />
          <PasswordField
            id="d-confirmPassword"
            label="Confirm password"
            placeholder="Repeat the password"
            error={errors.confirmPassword?.message}
            registration={register("confirmPassword")}
          />

          {/* Divider */}
          <div className="border-t border-border pt-2">
            <p className="text-xs text-muted-foreground mb-3">Professional details (optional)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="d-specialization">Specialization</Label>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="d-specialization" placeholder="Cardiology, General Practice…" className="pl-9" {...register("specialization")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="d-licenseNumber">License number</Label>
              <Input id="d-licenseNumber" placeholder="KMD-2024-001" {...register("licenseNumber")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-department">Department</Label>
              <Input id="d-department" placeholder="Internal Medicine" {...register("department")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="d-consultationFee">Consultation fee (KES)</Label>
            <Input id="d-consultationFee" type="number" placeholder="2500" {...register("consultationFee")} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating…" : "Create Doctor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Admin Modal ───────────────────────────────────────────────────────────

function AddAdminModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddAdminFormData>({ resolver: zodResolver(addAdminSchema) });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-users"] });
      reset();
      setServerError(null);
      onClose();
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to create admin account.";
      setServerError(message);
    },
  });

  const onSubmit = async (data: AddAdminFormData) => {
    setServerError(null);
    const { confirmPassword: _, ...payload } = data;
    mutation.mutate({ role: "admin", ...payload });
  };

  const handleClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <UserCog className="h-4 w-4 text-amber-400" />
            </div>
            Add Administrator
          </DialogTitle>
          <DialogDescription>
            Grant full admin access to a new user. Use with caution.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
            <p className="text-sm text-red-400">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="a-email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="a-email"
                type="email"
                placeholder="admin@clinic.com"
                className={cn("pl-9", errors.email && "border-red-500")}
                {...register("email")}
              />
            </div>
            {errors.email?.message && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="a-phone">Phone (optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="a-phone" type="tel" placeholder="+254 700 000 000" className="pl-9" {...register("phone")} />
            </div>
          </div>

          <PasswordField
            id="a-password"
            label="Password"
            error={errors.password?.message}
            registration={register("password")}
          />
          <PasswordField
            id="a-confirmPassword"
            label="Confirm password"
            placeholder="Repeat the password"
            error={errors.confirmPassword?.message}
            registration={register("confirmPassword")}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating…" : "Create Admin"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [modal, setModal] = useState<ModalType>(null);
  const [search, setSearch] = useState("");

  // Guard — only admins can access
  if (user?.role !== "admin") {
    router.replace("/dashboard");
    return null;
  }

  const { data, isLoading } = useQuery({
    queryKey: ["system-users"],
    queryFn: fetchSystemUsers,
  });

  const doctors = data?.doctors ?? [];

  const filteredDoctors = doctors.filter((d) => {
    const name = `${d.firstName} ${d.lastName}`.toLowerCase();
    const q = search.toLowerCase();
    return (
      !search ||
      name.includes(q) ||
      (d.specialization ?? "").toLowerCase().includes(q) ||
      (d.department ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add doctors and administrators to the platform.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setModal("doctor")}
            className="gap-2 bg-teal-600 hover:bg-teal-500 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Doctor
          </Button>
          <Button
            onClick={() => setModal("admin")}
            variant="outline"
            className="gap-2 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
          >
            <Plus className="h-4 w-4" />
            Add Admin
          </Button>
        </div>
      </div>

      {/* Quick stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Doctors",
            value: isLoading ? "—" : doctors.length,
            icon: <Stethoscope className="h-5 w-5 text-teal-400" />,
            color: "bg-teal-500/10 border-teal-500/20",
          },
          {
            label: "Add Doctor",
            value: "Quick action",
            icon: <Plus className="h-5 w-5 text-teal-400" />,
            color: "bg-teal-500/10 border-teal-500/20",
            onClick: () => setModal("doctor"),
          },
          {
            label: "Add Admin",
            value: "Quick action",
            icon: <Shield className="h-5 w-5 text-amber-400" />,
            color: "bg-amber-500/10 border-amber-500/20",
            onClick: () => setModal("admin"),
          },
        ].map((card) => (
          <div
            key={card.label}
            onClick={card.onClick}
            className={cn(
              "rounded-2xl border p-4 flex items-center gap-4",
              card.color,
              card.onClick && "cursor-pointer hover:scale-105 transition-transform duration-200"
            )}
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", card.color)}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="font-bold text-sm">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Doctors table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-semibold flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-teal-400" />
            Doctors
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors…"
              className="pl-9 h-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Stethoscope className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">
              {search ? "No doctors match your search." : "No doctors yet. Add one above."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.doctorId}
                className="flex items-center gap-4 px-4 py-3 hover:bg-accent/40 transition-colors"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0 text-teal-400 font-bold text-sm">
                  {(doc.firstName?.[0] ?? "?").toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    Dr. {doc.firstName} {doc.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {doc.specialization ?? "—"}
                    {doc.department ? ` · ${doc.department}` : ""}
                  </p>
                </div>

                {doc.licenseNumber && (
                  <Badge variant="outline" className="text-xs hidden sm:flex">
                    {doc.licenseNumber}
                  </Badge>
                )}

                {doc.consultationFee && (
                  <p className="text-xs text-muted-foreground hidden md:block">
                    KES {Number(doc.consultationFee).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddDoctorModal open={modal === "doctor"} onClose={() => setModal(null)} />
      <AddAdminModal open={modal === "admin"} onClose={() => setModal(null)} />
    </div>
  );
}