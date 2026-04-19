"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBills, payBill, updateBill } from "@/lib/queries";
import { useAuthStore } from "@/store/auth.store";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { CreditCard, CheckCircle, X, Search, DollarSign, User, Calendar, Pencil } from "lucide-react";
import type { BillWithRelations } from "@/types";

const BILL_STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  pending:           { bg: "bg-yellow-500/10",  text: "text-yellow-500",  border: "border-yellow-500/20" },
  paid:              { bg: "bg-green-500/10",   text: "text-green-500",   border: "border-green-500/20" },
  partially_paid:    { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20" },
  insurance_pending: { bg: "bg-purple-500/10",  text: "text-purple-400",  border: "border-purple-500/20" },
  written_off:       { bg: "bg-gray-500/10",    text: "text-gray-400",    border: "border-gray-500/20" },
};

const BILL_STATUSES = [
  { value: "pending",           label: "Pending" },
  { value: "partially_paid",    label: "Partially paid" },
  { value: "insurance_pending", label: "Insurance pending" },
  { value: "written_off",       label: "Written off" },
  { value: "paid",              label: "Paid" },
];

const PAYMENT_METHODS = [
  { value: "mpesa",         label: "M-Pesa" },
  { value: "cash",          label: "Cash" },
  { value: "card",          label: "Credit/Debit card" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "insurance",     label: "Insurance" },
];

const PAGE_SIZE = 10;

function fmt(val: string | null | undefined) {
  const n = Number(val ?? 0);
  return isNaN(n) ? "—" : `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
}

// ── Pay Modal (patient / admin) ────────────────────────────────────────────────
function PayModal({ bill, onClose }: { bill: BillWithRelations; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState("mpesa");
  const [amount, setAmount] = useState(bill.patientPayable);
  const [error, setError]   = useState<string | null>(null);

  const patientName = `${bill.patient.firstName} ${bill.patient.lastName}`;

  const mutation = useMutation({
    mutationFn: () => payBill(bill.billId, { paymentMethod: method, amount: Number(amount) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      onClose();
    },
    onError: (err: unknown) => {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Payment failed."
      );
    },
  });

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-6 animate-fade-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <DollarSign size={15} className="text-green-500" />
              </div>
              <div>
                <p className="font-display font-bold text-base text-foreground">Process payment</p>
                <p className="text-xs text-muted-foreground">{patientName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-accent border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-accent border border-border mb-5 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 mb-1">
              <User size={11} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{patientName}</span>
              {bill.patient.user?.email && (
                <span className="text-xs text-muted-foreground">· {bill.patient.user.email}</span>
              )}
            </div>
            {bill.appointment && (
              <div className="flex items-center gap-1.5 mb-2">
                <Calendar size={11} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {(() => { try { return format(parseISO(bill.appointment.appointmentDate), "MMM d, yyyy"); } catch { return bill.appointment.appointmentDate; } })()}
                  {" · "}<span className="capitalize">{bill.appointment.appointmentType}</span>
                </span>
              </div>
            )}
            <div className="h-px bg-border" />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-muted-foreground">Total amount</span>
              <span className="text-foreground font-medium">{fmt(bill.amount)}</span>
            </div>
            {Number(bill.insuranceCovered ?? 0) > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Insurance covered</span>
                <span className="text-teal-400 font-medium">−{fmt(bill.insuranceCovered)}</span>
              </div>
            )}
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span className="text-foreground/80 font-medium">Patient owes</span>
              <span className="text-foreground font-bold font-display">{fmt(bill.patientPayable)}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-sm text-red-400">{error}</div>
          )}

          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Payment method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Amount (KES)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9"
                  placeholder="Enter amount"
                />
              </div>
            </div>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="w-full font-display font-bold">
              {mutation.isPending ? "Processing..." : "Confirm payment"}
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Edit Bill Modal (admin only) ───────────────────────────────────────────────
function EditBillModal({ bill, onClose }: { bill: BillWithRelations; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>(bill.billStatus);
  const [insuranceCovered, setInsuranceCovered] = useState(bill.insuranceCovered ?? "0");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => updateBill(bill.billId, { billStatus: status, insuranceCovered }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      onClose();
    },
    onError: (err: unknown) => {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Update failed."
      );
    },
  });

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-lg p-6 animate-fade-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Pencil size={14} className="text-primary" />
              </div>
              <p className="font-display font-bold text-base text-foreground">Edit bill</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-accent border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-accent border border-border mb-4">
            <p className="text-xs text-muted-foreground mb-0.5">Patient</p>
            <p className="text-sm font-medium text-foreground">
              {bill.patient.firstName} {bill.patient.lastName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total: {fmt(bill.amount)}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-sm text-red-400">{error}</div>
          )}

          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label>Bill status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BILL_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Insurance covered (KES)</Label>
              <Input
                type="number"
                value={insuranceCovered}
                onChange={(e) => setInsuranceCovered(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="flex-1">
                {mutation.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function BillingPage() {
  const { isAdmin } = useAuthStore();
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("all");
  const [payingBill, setPayingBill] = useState<BillWithRelations | null>(null);
  const [editingBill, setEditingBill] = useState<BillWithRelations | null>(null);
  const [page, setPage]             = useState(1);

  const { data: bills, isLoading } = useQuery({
    queryKey: ["bills"],
    queryFn: () => fetchBills(),
  });

  const filtered = useMemo(() => {
    return (bills ?? []).filter((b) => {
      if (statusFilter !== "all" && b.billStatus !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const patientName = `${b.patient.firstName} ${b.patient.lastName}`.toLowerCase();
        const email       = b.patient.user?.email?.toLowerCase() ?? "";
        return patientName.includes(q) || email.includes(q) || b.billId.toLowerCase().includes(q);
      }
      return true;
    });
  }, [bills, statusFilter, search]);

  const total      = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleStatus = (val: string) => { setStatus(val); setPage(1); };

  // Summary stats
  const pendingTotal = useMemo(
    () => (bills ?? []).filter((b) => b.billStatus === "pending").reduce((s, b) => s + Number(b.patientPayable ?? 0), 0),
    [bills]
  );

  return (
    <>
      <div className="flex flex-col gap-5 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">Billing</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading ? "Loading…" : `${total} bill${total !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Pending",     value: (bills ?? []).filter((b) => b.billStatus === "pending").length,      accent: "text-yellow-500" },
            { label: "Paid",        value: (bills ?? []).filter((b) => b.billStatus === "paid").length,         accent: "text-green-500" },
            { label: "Partial",     value: (bills ?? []).filter((b) => b.billStatus === "partially_paid").length, accent: "text-blue-400" },
            { label: "Outstanding", value: `KES ${pendingTotal.toLocaleString("en-KE")}`,                       accent: "text-yellow-500" },
          ].map(({ label, value, accent }) => (
            <div key={label} className="p-4 rounded-2xl bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={cn("text-xl font-bold font-display", accent)}>{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 px-4 py-4 border-b border-border">
            <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-accent border border-border focus-within:border-primary/50 transition-all flex-1">
              <Search size={13} className="text-muted-foreground flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by patient name or email…"
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatus}>
              <SelectTrigger className="h-9 w-full sm:w-44 text-sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {BILL_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bills list */}
          <div className="px-4 py-2">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            ) : !filtered.length ? (
              <div className="flex flex-col items-center justify-center gap-3 h-48 rounded-2xl border border-dashed border-border text-muted-foreground">
                <CreditCard size={24} />
                <p className="text-sm">No bills found</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {pageRows.map((bill) => {
                    const style       = BILL_STATUS_STYLES[bill.billStatus] ?? BILL_STATUS_STYLES.pending;
                    const patientName = `${bill.patient.firstName} ${bill.patient.lastName}`;
                    const email       = bill.patient.user?.email;
                    const apptDateStr = bill.appointment ? (() => {
                      try { return format(parseISO(bill.appointment.appointmentDate), "MMM d, yyyy"); }
                      catch { return bill.appointment.appointmentDate; }
                    })() : null;
                    const createdStr = (() => {
                      try { return format(parseISO(bill.createdAt), "MMM d, yyyy"); }
                      catch { return ""; }
                    })();

                    return (
                      <div
                        key={bill.billId}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-2xl bg-card border border-border hover:border-border/80 transition-all"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                            <CreditCard size={16} className="text-yellow-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-foreground">{fmt(bill.amount)}</p>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full border text-[10px] font-semibold capitalize whitespace-nowrap",
                                style.bg, style.text, style.border,
                              )}>
                                {bill.billStatus.replace("_", " ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <User size={11} className="text-muted-foreground shrink-0" />
                              <p className="text-xs text-foreground font-medium truncate">{patientName}</p>
                              {email && <p className="text-xs text-muted-foreground truncate hidden sm:block">· {email}</p>}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {apptDateStr && (
                                <>
                                  <Calendar size={10} className="inline mr-1 text-muted-foreground" />
                                  <span className="capitalize">{bill.appointment?.appointmentType}</span>
                                  {" · "}{apptDateStr}{" · "}
                                </>
                              )}
                              Owes <span className="text-foreground">{fmt(bill.patientPayable)}</span>
                              {Number(bill.insuranceCovered ?? 0) > 0 && ` · Insurance: ${fmt(bill.insuranceCovered)}`}
                              {createdStr && ` · Billed ${createdStr}`}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 justify-end sm:justify-start shrink-0">
                          {/* Admin: edit bill */}
                          {isAdmin() && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingBill(bill)}
                              className="text-muted-foreground hover:text-primary"
                              title="Edit bill"
                            >
                              <Pencil size={13} />
                            </Button>
                          )}
                          {/* Pay button — unpaid bills */}
                          {bill.billStatus !== "paid" && bill.billStatus !== "written_off" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPayingBill(bill)}
                              className="w-full sm:w-auto"
                            >
                              <DollarSign className="mr-1 h-3 w-3" /> Pay
                            </Button>
                          ) : bill.billStatus === "paid" ? (
                            <div className="flex items-center gap-1.5 text-xs text-green-500">
                              <CheckCircle className="h-3 w-3" />
                              {bill.paymentMethod && (
                                <span className="capitalize truncate">{bill.paymentMethod.replace("_", " ")}</span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <PaginationControls page={safePage} totalPages={totalPages} onPageChange={setPage} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {payingBill  && <PayModal     bill={payingBill}  onClose={() => setPayingBill(null)}  />}
      {editingBill && <EditBillModal bill={editingBill} onClose={() => setEditingBill(null)} />}
    </>
  );
}