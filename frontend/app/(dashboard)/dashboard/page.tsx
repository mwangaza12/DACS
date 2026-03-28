"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users, Calendar, CreditCard, Clock, Activity,
} from "lucide-react";
import { fetchDashboardMetrics } from "@/lib/queries";
import { useAuthStore } from "@/store/auth.store";
import { StatCard } from "@/components/dashboard/stat-card";
import { AppointmentChart } from "@/components/dashboard/appointment-chart";
import { DemographicsChart } from "@/components/dashboard/demographics-chart";
import { RecentAppointments } from "@/components/dashboard/recent-appointments";
import { RevenueCard } from "@/components/dashboard/revenue-card";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";

export default function DashboardPage() {
  const { user, isAdmin, isDoctor, isPatient } = useAuthStore();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: fetchDashboardMetrics,
    enabled: !!user,
  });

  const role = {
    isAdmin: isAdmin(),
    isDoctor: isDoctor(),
    isPatient: isPatient(),
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-up">

      {/* KPI row - Different metrics based on role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* For Patients: Show personal stats */}
        {role.isPatient && (
          <>
            <StatCard
              label="My appointments"
              value={metrics?.myAppointments ?? 0}
              icon={<Calendar size={18} />}
              accent="indigo"
              loading={isLoading}
              trend={{ value: "Upcoming", direction: "neutral" }}
            />
            <StatCard
              label="Today's appointments"
              value={metrics?.myTodayAppointments ?? 0}
              icon={<Clock size={18} />}
              accent="teal"
              loading={isLoading}
              trend={{ value: (metrics?.myTodayAppointments ?? 0) > 0 ? "Today" : "None", direction: "neutral" }}
            />
            <StatCard
              label="Pending payments"
              value={metrics?.myPendingPayments ?? 0}
              icon={<CreditCard size={18} />}
              accent="amber"
              loading={isLoading}
              trend={{
                value: (metrics?.myPendingPayments ?? 0) > 0 ? "Due" : "All paid",
                direction: (metrics?.myPendingPayments ?? 0) > 0 ? "down" : "up",
              }}
            />
            <StatCard
              label="Completed visits"
              value={metrics?.myCompletedVisits ?? 0}
              icon={<Activity size={18} />}
              accent="green"
              loading={isLoading}
              trend={{ value: "All time", direction: "neutral" }}
            />
          </>
        )}

        {/* For Doctors: Show doctor-specific stats */}
        {role.isDoctor && (
          <>
            <StatCard
              label="My patients"
              value={metrics?.myPatients ?? 0}
              icon={<Users size={18} />}
              accent="indigo"
              loading={isLoading}
              trend={{ value: "Active", direction: "neutral" }}
            />
            <StatCard
              label="My appointments"
              value={metrics?.myAppointments ?? 0}
              icon={<Calendar size={18} />}
              accent="teal"
              loading={isLoading}
              trend={{ value: "All time", direction: "neutral" }}
            />
            <StatCard
              label="Today's schedule"
              value={metrics?.myTodayAppointments ?? 0}
              icon={<Clock size={18} />}
              accent="amber"
              loading={isLoading}
              trend={{
                value: (metrics?.myTodayAppointments ?? 0) > 0 ? `${metrics?.myTodayAppointments} patients` : "No appointments",
                direction: (metrics?.myTodayAppointments ?? 0) > 0 ? "up" : "neutral",
              }}
            />
            <StatCard
              label="Pending approvals"
              value={metrics?.pendingApprovals ?? 0}
              icon={<Activity size={18} />}
              accent="red"
              loading={isLoading}
              trend={{
                value: (metrics?.pendingApprovals ?? 0) > 0 ? "Action needed" : "All approved",
                direction: (metrics?.pendingApprovals ?? 0) > 0 ? "down" : "up",
              }}
            />
          </>
        )}

        {/* For Admins: Show admin stats */}
        {role.isAdmin && (
          <>
            <StatCard
              label="Total patients"
              value={metrics?.totalPatients ?? 0}
              icon={<Users size={18} />}
              accent="indigo"
              loading={isLoading}
              trend={{ value: "Active", direction: "neutral" }}
            />
            <StatCard
              label="Total appointments"
              value={metrics?.totalAppointments ?? 0}
              icon={<Calendar size={18} />}
              accent="teal"
              loading={isLoading}
              trend={{ value: "All time", direction: "neutral" }}
            />
            <StatCard
              label="Today's appointments"
              value={metrics?.todayAppointments ?? 0}
              icon={<Clock size={18} />}
              accent="amber"
              loading={isLoading}
              trend={{
                value: (metrics?.todayAppointments ?? 0) > 0 ? "Active" : "None today",
                direction: (metrics?.todayAppointments ?? 0) > 0 ? "up" : "neutral",
              }}
            />
            <StatCard
              label="Pending bills"
              value={metrics?.pendingBills ?? 0}
              icon={<CreditCard size={18} />}
              accent={(metrics?.pendingBills ?? 0) > 0 ? "red" : "green"}
              loading={isLoading}
              trend={{
                value: (metrics?.pendingBills ?? 0) > 0 ? "Needs attention" : "All clear",
                direction: (metrics?.pendingBills ?? 0) > 0 ? "down" : "up",
              }}
            />
          </>
        )}
      </div>

      {/* Bento grid - Role-based layout */}
      <div className="grid grid-cols-12 gap-4">

        {/* For Patients: Show patient-specific charts */}
        {role.isPatient && (
          <>
            <div className="col-span-12 lg:col-span-8 rounded-2xl bg-card border border-border p-5">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-display font-bold text-sm text-text-primary">My upcoming appointments</p>
                  <p className="text-xs text-text-tertiary font-body mt-0.5">Next 7 days schedule</p>
                </div>
                <RecentAppointments />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 rounded-2xl bg-card border border-border p-5">
              <MiniCalendar />
            </div>

            <div className="col-span-12 lg:col-span-6 rounded-2xl bg-card border border-border p-5">
              <NotificationsWidget />
            </div>

            <div className="col-span-12 lg:col-span-6 rounded-2xl bg-card border border-border p-5">
              <div className="flex flex-col gap-3 h-full">
                <div>
                  <p className="font-display font-bold text-sm text-text-primary">Quick actions</p>
                  <p className="text-xs text-text-tertiary font-body mt-0.5">Common tasks</p>
                </div>
                <div className="grid grid-cols-2 gap-2 flex-1">
                  {[
                    { label: "Book appointment", href: "/appointments/new", icon: <Calendar size={15} />, cls: "bg-primary-500/10 text-primary-400 border-primary-500/20 hover:bg-primary-500/20" },
                    { label: "View records", href: "/medical-records", icon: <Activity size={15} />, cls: "bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20" },
                    { label: "Pay bills", href: "/billing", icon: <CreditCard size={15} />, cls: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20" },
                    { label: "My doctors", href: "/doctors", icon: <Users size={15} />, cls: "bg-success/10 text-success border-success/20 hover:bg-success/20" },
                  ].map((action) => (
                    <a
                      key={action.href}
                      href={action.href}
                      className={`flex flex-col items-start gap-2 p-3 rounded-xl border transition-all duration-150 ${action.cls}`}
                    >
                      {action.icon}
                      <span className="text-xs font-medium font-body leading-tight">{action.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* For Doctors: Show doctor-specific widgets */}
        {role.isDoctor && (
          <>
            <div className="col-span-12 lg:col-span-8 rounded-2xl bg-card border border-border p-5">
              <AppointmentChart />
            </div>

            <div className="col-span-12 lg:col-span-4 rounded-2xl bg-card border border-border p-5">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-display font-bold text-sm text-text-primary">My schedule</p>
                  <p className="text-xs text-text-tertiary font-body mt-0.5">Today's appointments</p>
                </div>
                <RecentAppointments />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7 rounded-2xl bg-card border border-border p-5">
              <NotificationsWidget />
            </div>

            <div className="col-span-12 lg:col-span-2 rounded-2xl bg-card border border-border p-5">
              <MiniCalendar />
            </div>

            <div className="col-span-12 lg:col-span-3 rounded-2xl bg-card border border-border p-5">
              <RevenueCard />
            </div>

            <div className="col-span-12 lg:col-span-12 rounded-2xl bg-card border border-border p-5">
              <div className="flex flex-col gap-3">
                <div>
                  <p className="font-display font-bold text-sm text-text-primary">Quick actions</p>
                  <p className="text-xs text-text-tertiary font-body mt-0.5">Common tasks</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: "Add prescription", href: "/prescriptions/new", icon: <Activity size={15} />, cls: "bg-primary-500/10 text-primary-400 border-primary-500/20 hover:bg-primary-500/20" },
                    { label: "View schedule", href: "/schedule", icon: <Calendar size={15} />, cls: "bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20" },
                    { label: "Patient records", href: "/patients", icon: <Users size={15} />, cls: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20" },
                    { label: "Write notes", href: "/notes", icon: <Clock size={15} />, cls: "bg-success/10 text-success border-success/20 hover:bg-success/20" },
                  ].map((action) => (
                    <a
                      key={action.href}
                      href={action.href}
                      className={`flex flex-col items-start gap-2 p-3 rounded-xl border transition-all duration-150 ${action.cls}`}
                    >
                      {action.icon}
                      <span className="text-xs font-medium font-body leading-tight">{action.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* For Admins: Show admin widgets */}
        {role.isAdmin && (
          <>
            <div className="col-span-12 lg:col-span-8 rounded-2xl bg-card border border-border p-5">
              <AppointmentChart />
            </div>

            <div className="col-span-12 lg:col-span-4 rounded-2xl bg-card border border-border p-5">
              <DemographicsChart />
            </div>

            <div className="col-span-12 lg:col-span-7 rounded-2xl bg-card border border-border p-5">
              <RecentAppointments />
            </div>

            <div className="col-span-12 lg:col-span-3 rounded-2xl bg-card border border-border p-5">
              <RevenueCard />
            </div>

            <div className="col-span-12 lg:col-span-2 rounded-2xl bg-card border border-border p-5">
              <MiniCalendar />
            </div>

            <div className="col-span-12 lg:col-span-4 rounded-2xl bg-card border border-border p-5">
              <NotificationsWidget />
            </div>

            <div className="col-span-12 lg:col-span-4 rounded-2xl bg-card border border-border p-5">
              <div className="flex flex-col gap-3 h-full">
                <div>
                  <p className="font-display font-bold text-sm text-text-primary">Quick actions</p>
                  <p className="text-xs text-text-tertiary font-body mt-0.5">Common tasks</p>
                </div>
                <div className="grid grid-cols-2 gap-2 flex-1">
                  {[
                    { label: "New appointment", href: "/appointments/new", icon: <Calendar size={15} />, cls: "bg-primary-500/10 text-primary-400 border-primary-500/20 hover:bg-primary-500/20" },
                    { label: "Patient records", href: "/patients", icon: <Users size={15} />, cls: "bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20" },
                    { label: "View billing", href: "/billing", icon: <CreditCard size={15} />, cls: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20" },
                    { label: "Reports", href: "/reports", icon: <Activity size={15} />, cls: "bg-success/10 text-success border-success/20 hover:bg-success/20" },
                  ].map((action) => (
                    <a
                      key={action.href}
                      href={action.href}
                      className={`flex flex-col items-start gap-2 p-3 rounded-xl border transition-all duration-150 ${action.cls}`}
                    >
                      {action.icon}
                      <span className="text-xs font-medium font-body leading-tight">{action.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}