"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBills, payBill } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { CreditCard, CheckCircle, X, Search, DollarSign } from "lucide-react";

const BILL_STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  pending:           { bg: "bg-warning/10",         text: "text-warning",     border: "border-warning/20" },
  paid:              { bg: "bg-success/10",          text: "text-success",     border: "border-success/20" },
  partially_paid:    { bg: "bg-blue-500/10",         text: "text-blue-400",    border: "border-blue-500/20" },
  insurance_pending: { bg: "bg-violet-500/10",       text: "text-violet-400",  border: "border-violet-500/20" },
  written_off:       { bg: "bg-border",              text: "text-text-muted",  border: "border-border" },
};

const PAYMENT_METHODS = [
  { value: "mpesa",       label: "M-Pesa" },
  { value: "cash",        label: "Cash" },
  { value: "card",        label: "Credit/Debit card" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "insurance",   label: "Insurance" },
];

function fmt(val: string | null | undefined) {
  const n = Number(val ?? 0);
  return isNaN(n) ? "—" : `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
}

type Bill = {
  billId: string;
  appointmentId: string | null;
  patientId: string;
  amount: string | null;
  insuranceCovered: string | null;
  patientPayable: string;
  billStatus: string;
  paymentMethod: string | null;
  paymentDate: string | null;
  createdAt: string;
};

interface PayModalProps {
  bill: Bill;
  onClose: () => void;
}

function PayModal({ bill, onClose }: PayModalProps) {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState("mpesa");
  const [amount, setAmount] = useState(bill.patientPayable);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => payBill(bill.billId, { paymentMethod: method, amount: Number(amount) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Payment failed.";
      setError(msg);
    },
  });

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-canvas/70 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-card p-6 animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
                <DollarSign size={15} className="text-success" />
              </div>
              <p className="font-display font-bold text-base text-text-primary">Process payment</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-card border border-border text-text-secondary hover:text-text-primary transition-all cursor-pointer">
              <X size={14} />
            </button>
          </div>

          {/* Bill summary */}
          <div className="p-4 rounded-xl bg-card border border-border mb-5 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-body">
              <span className="text-text-tertiary">Total amount</span>
              <span className="text-text-primary font-medium">{fmt(bill.amount)}</span>
            </div>
            {Number(bill.insuranceCovered ?? 0) > 0 && (
              <div className="flex justify-between text-xs font-body">
                <span className="text-text-tertiary">Insurance covered</span>
                <span className="text-teal-400 font-medium">−{fmt(bill.insuranceCovered)}</span>
              </div>
            )}
            <div className="h-px bg-border/60" />
            <div className="flex justify-between text-sm font-body">
              <span className="text-text-secondary font-medium">Patient owes</span>
              <span className="text-text-primary font-bold font-display">{fmt(bill.patientPayable)}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-danger/30 text-sm text-danger/90 font-body">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Select
              label="Payment method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              options={PAYMENT_METHODS}
            />
            <Input
              label="Amount (KES)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              leftIcon={<DollarSign size={15} />}
            />
            <Button
              fullWidth
              loading={mutation.isPending}
              onClick={() => mutation.mutate()}
              className="font-display font-bold mt-1"
            >
              <CheckCircle size={15} /> Confirm payment
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function BillingPage() {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [payingBill, setPayingBill] = useState<Bill | null>(null);

  const { data: bills, isLoading } = useQuery({
    queryKey: ["bills"],
    queryFn: () => fetchBills(),
  });

  const filtered = (bills ?? []).filter((b) => {
    if (statusFilter !== "all" && b.billStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.billId.toLowerCase().includes(q) || b.patientId.toLowerCase().includes(q);
    }
    return true;
  });

  // Totals
  const totalPending = filtered
    .filter((b) => b.billStatus === "pending")
    .reduce((s, b) => s + Number(b.patientPayable), 0);

  return (
    <>
      <div className="flex flex-col gap-5 animate-fade-up">

        {/* Summary row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total bills",    value: filtered.length,                                         accent: "text-text-primary" },
            { label: "Pending",        value: filtered.filter((b) => b.billStatus === "pending").length,  accent: "text-warning" },
            { label: "Paid",           value: filtered.filter((b) => b.billStatus === "paid").length,     accent: "text-success" },
            { label: "Pending amount", value: `KES ${totalPending.toLocaleString()}`,                   accent: "text-danger" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-2xl bg-card border border-border">
              <p className="text-xs text-text-muted font-body mb-1">{s.label}</p>
              <p className={`font-display font-bold text-2xl ${s.accent}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-card border border-border focus-within:border-primary-500/50 transition-all">
              <Search size={13} className="text-text-tertiary flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bills…"
                className="bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none w-44 font-body"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 px-3 rounded-xl bg-card border border-border text-sm text-text-secondary font-body appearance-none cursor-pointer focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially paid</option>
              <option value="insurance_pending">Insurance pending</option>
            </select>
          </div>
          <p className="text-xs text-text-tertiary font-body">
            {isLoading ? "Loading…" : `${filtered.length} bill${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Bills list */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : !filtered.length ? (
          <div className="flex flex-col items-center justify-center gap-3 h-48 rounded-2xl border border-dashed border-border text-text-muted">
            <CreditCard size={24} />
            <p className="text-sm font-body">No bills found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((bill) => {
              const style = BILL_STATUS_STYLES[bill.billStatus] ?? BILL_STATUS_STYLES.pending;
              const createdStr = (() => {
                try { return format(parseISO(bill.createdAt), "MMM d, yyyy"); }
                catch { return ""; }
              })();

              return (
                <div key={bill.billId} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-border/80 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={16} className="text-warning" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-text-primary font-body">{fmt(bill.amount)}</p>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full border text-[10px] font-semibold font-body capitalize",
                        style.bg, style.text, style.border,
                      )}>
                        {bill.billStatus.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-text-tertiary font-body">
                      Patient owes <span className="text-text-primary">{fmt(bill.patientPayable)}</span>
                      {Number(bill.insuranceCovered ?? 0) > 0 && ` · Insurance: ${fmt(bill.insuranceCovered)}`}
                      {createdStr && ` · ${createdStr}`}
                    </p>
                  </div>

                  {bill.billStatus !== "paid" && bill.billStatus !== "written_off" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPayingBill(bill)}
                    >
                      <DollarSign size={12} /> Pay
                    </Button>
                  )}
                  {bill.billStatus === "paid" && (
                    <div className="flex items-center gap-1.5 text-xs text-success font-body">
                      <CheckCircle size={13} />
                      {bill.paymentMethod && <span className="capitalize">{bill.paymentMethod.replace("_", " ")}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {payingBill && <PayModal bill={payingBill} onClose={() => setPayingBill(null)} />}
    </>
  );
}