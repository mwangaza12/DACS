"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, CreditCard, Clock, Activity, FileText, Bell } from "lucide-react";
import { fetchDashboardMetrics, fetchBills, fetchAppointments } from "@/lib/queries";
import { useAuthStore } from "@/store/auth.store";
import { StatCard } from "@/components/dashboard/stat-card";
import { AppointmentChart } from "@/components/dashboard/appointment-chart";
import { DemographicsChart } from "@/components/dashboard/demographics-chart";
import { RecentAppointments } from "@/components/dashboard/recent-appointments";
import { RevenueCard } from "@/components/dashboard/revenue-card";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";

// ── Shared card wrapper ────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-card border border-border p-5 ${className}`}>
      {children}
    </div>
  );
}

// ── Quick actions (role-specific) ─────────────────────────────────────────────
const ACTIONS: Record<string, Array<{ label: string; href: string; icon: React.ReactNode; cls: string }>> = {
  admin: [
    { label: "New appointment", href: "/appointments/new", icon: <Calendar size={15} />,   cls: "bg-primary-500/10 text-primary-400 border-primary-500/20 hover:bg-primary-500/20" },
    { label: "Patient records",  href: "/patients",         icon: <Users size={15} />,      cls: "bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20" },
    { label: "Billing",          href: "/billing",          icon: <CreditCard size={15} />, cls: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20" },
    { label: "Reports",          href: "/reports",          icon: <Activity size={15} />,   cls: "bg-success/10 text-success border-success/20 hover:bg-success/20" },
  ],
  doctor: [
    { label: "My schedule",     href: "/appointments",     icon: <Calendar size={15} />,   cls: "bg-primary-500/10 text-primary-400 border-primary-500/20 hover:bg-primary-500/20" },
    { label: "Patients",        href: "/patients",         icon: <Users size={15} />,      cls: "bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20" },
    { label: "Medical records", href: "/medical-records",  icon: <FileText size={15} />,   cls: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20" },
    { label: "Reports",         href: "/reports",          icon: <Activity size={15} />,   cls: "bg-success/10 text-success border-success/20 hover:bg-success/20" },
  ],
  patient: [
    { label: "Book appointment", href: "/appointments/new", icon: <Calendar size={15} />,  cls: "bg-primary-500/10 text-primary-400 border-primary-500/20 hover:bg-primary-500/20" },
    { label: "My records",       href: "/medical-records",  icon: <FileText size={15} />,  cls: "bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20" },
    { label: "My bills",         href: "/billing",          icon: <CreditCard size={15} />,cls: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20" },
    { label: "Notifications",    href: "/notifications",    icon: <Bell size={15} />,       cls: "bg-success/10 text-success border-success/20 hover:bg-success/20" },
  ],
};

function QuickActions({ role }: { role: string }) {
  const actions = ACTIONS[role] ?? ACTIONS.patient;
  return (
    <div className="flex flex-col gap-3 h-full">
      <div>
        <p className="font-display font-bold text-sm text-text-primary">Quick actions</p>
        <p className="text-xs text-text-tertiary font-body mt-0.5">Common tasks</p>
      </div>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {actions.map((a) => (
          <a key={a.href} href={a.href}
            className={`flex flex-col items-start gap-2 p-3 rounded-xl border transition-all duration-150 ${a.cls}`}>
            {a.icon}
            <span className="text-xs font-medium font-body leading-tight">{a.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Admin dashboard ────────────────────────────────────────────────────────────
function AdminDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn:  fetchDashboardMetrics,
  });

  return (
    <div className="flex flex-col gap-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total patients"       value={metrics?.totalPatients ?? 0}     icon={<Users size={18} />}     accent="indigo" loading={isLoading} trend={{ value: "Registered", direction: "neutral" }} />
        <StatCard label="Total appointments"   value={metrics?.totalAppointments ?? 0} icon={<Calendar size={18} />}  accent="teal"   loading={isLoading} trend={{ value: "All time", direction: "neutral" }} />
        <StatCard label="Today's appointments" value={metrics?.todayAppointments ?? 0} icon={<Clock size={18} />}     accent="amber"  loading={isLoading}
          trend={{ value: (metrics?.todayAppointments ?? 0) > 0 ? "Active" : "None today", direction: (metrics?.todayAppointments ?? 0) > 0 ? "up" : "neutral" }} />
        <StatCard label="Pending bills"        value={metrics?.pendingBills ?? 0}      icon={<CreditCard size={18} />}
          accent={(metrics?.pendingBills ?? 0) > 0 ? "red" : "green"} loading={isLoading}
          trend={{ value: (metrics?.pendingBills ?? 0) > 0 ? "Needs attention" : "All clear", direction: (metrics?.pendingBills ?? 0) > 0 ? "down" : "up" }} />
      </div>

      {/* Row 1: chart (8) + demographics (4) */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-8"><AppointmentChart /></Card>
        <Card className="col-span-12 lg:col-span-4"><DemographicsChart /></Card>
      </div>

      {/* Row 2: recent appointments (7) + revenue (5) */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-7"><RecentAppointments /></Card>
        <Card className="col-span-12 lg:col-span-5"><RevenueCard /></Card>
      </div>

      {/* Row 3: calendar (4) + notifications (4) + quick actions (4) */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-4"><MiniCalendar /></Card>
        <Card className="col-span-12 lg:col-span-4"><NotificationsWidget /></Card>
        <Card className="col-span-12 lg:col-span-4"><QuickActions role="admin" /></Card>
      </div>
    </div>
  );
}

// ── Doctor dashboard ───────────────────────────────────────────────────────────
function DoctorDashboard() {
  const { user } = useAuthStore();
  const { data: myAppointments, isLoading } = useQuery({
    queryKey: ["appointments", "doctor", user?.userId],
    queryFn:  () => fetchAppointments({ doctorId: user?.userId, limit: 100 }),
    enabled:  !!user?.userId,
  });

  const todayStr  = new Date().toISOString().slice(0, 10);
  const myToday   = (myAppointments ?? []).filter((a) => a.appointmentDate === todayStr).length;
  const myTotal   = myAppointments?.length ?? 0;
  const myPending = (myAppointments ?? []).filter((a) =>
    a.appointmentStatus === "scheduled" || a.appointmentStatus === "confirmed"
  ).length;

  return (
    <div className="flex flex-col gap-5">
      {/* KPIs — doctor's own data only */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="My appointments today" value={myToday}   icon={<Clock size={18} />}    accent="amber"  loading={isLoading}
          trend={{ value: myToday > 0 ? "Scheduled" : "Free day", direction: myToday > 0 ? "up" : "neutral" }} />
        <StatCard label="Total my appointments" value={myTotal}   icon={<Calendar size={18} />} accent="teal"   loading={isLoading} trend={{ value: "All time", direction: "neutral" }} />
        <StatCard label="Pending confirmations" value={myPending} icon={<Users size={18} />}    accent={myPending > 0 ? "red" : "green"} loading={isLoading}
          trend={{ value: myPending > 0 ? "Needs action" : "All confirmed", direction: myPending > 0 ? "down" : "up" }} />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-8"><AppointmentChart /></Card>
        <Card className="col-span-12 lg:col-span-4"><RevenueCard /></Card>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-8"><RecentAppointments /></Card>
        <Card className="col-span-12 lg:col-span-4"><MiniCalendar /></Card>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-6"><NotificationsWidget /></Card>
        <Card className="col-span-12 lg:col-span-6"><QuickActions role="doctor" /></Card>
      </div>
    </div>
  );
}

// ── Patient dashboard ──────────────────────────────────────────────────────────
function PatientDashboard() {
  const { user } = useAuthStore();

  const { data: myAppointments, isLoading: apptLoading } = useQuery({
    queryKey: ["appointments", "patient", user?.userId],
    queryFn:  () => fetchAppointments({ patientId: user?.userId, limit: 100 }),
    enabled:  !!user?.userId,
  });

  const { data: myBills, isLoading: billLoading } = useQuery({
    queryKey: ["bills", "patient", user?.userId],
    queryFn:  () => fetchBills(user?.userId),
    enabled:  !!user?.userId,
  });

  const todayStr     = new Date().toISOString().slice(0, 10);
  const upcoming     = (myAppointments ?? []).filter((a) =>
    a.appointmentDate >= todayStr && !["cancelled","no_show"].includes(a.appointmentStatus)
  ).length;
  const completed    = (myAppointments ?? []).filter((a) => a.appointmentStatus === "completed").length;
  const pendingBills = (myBills ?? []).filter((b) =>
    b.billStatus === "pending" || b.billStatus === "partially_paid"
  ).length;

  return (
    <div className="flex flex-col gap-5">
      {/* KPIs — patient's own data only. NO clinic-wide stats. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Upcoming appointments" value={upcoming}     icon={<Calendar size={18} />} accent="indigo" loading={apptLoading}
          trend={{ value: upcoming > 0 ? "Scheduled" : "Book one now", direction: upcoming > 0 ? "up" : "neutral" }} />
        <StatCard label="Past consultations"    value={completed}    icon={<FileText size={18} />} accent="teal"   loading={apptLoading} trend={{ value: "Completed", direction: "neutral" }} />
        <StatCard label="Outstanding bills"     value={pendingBills} icon={<CreditCard size={18} />}
          accent={pendingBills > 0 ? "red" : "green"} loading={billLoading}
          trend={{ value: pendingBills > 0 ? "Payment due" : "All settled", direction: pendingBills > 0 ? "down" : "up" }} />
      </div>

      {/* Row 1 — recent appointments + calendar */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-8"><RecentAppointments /></Card>
        <Card className="col-span-12 lg:col-span-4"><MiniCalendar /></Card>
      </div>

      {/* Row 2 — notifications + quick actions */}
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-6"><NotificationsWidget /></Card>
        <Card className="col-span-12 lg:col-span-6"><QuickActions role="patient" /></Card>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role ?? "patient";

  return (
    <div className="animate-fade-up">
      {role === "admin"   && <AdminDashboard />}
      {role === "doctor"  && <DoctorDashboard />}
      {role === "patient" && <PatientDashboard />}
    </div>
  );
}