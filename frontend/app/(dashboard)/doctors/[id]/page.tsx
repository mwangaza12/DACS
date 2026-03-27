"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDoctorById, fetchDoctorAvailability, updateDoctorAvailability } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ArrowLeft, Building2, CreditCard, Hash, Clock, Plus, Trash2, CheckCircle } from "lucide-react";

const DAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "0", label: "Sunday" },
];

export type AvailabilitySlot = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
};

type AvailabilityRecord = {
  doctorAvailabilityId: string;
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
};

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: doctor, isLoading } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => fetchDoctorById(id),
    enabled: !!id,
  });

  const { data: availability, isLoading: avLoading } = useQuery({
    queryKey: ["doctor-availability", id],
    queryFn: () => fetchDoctorAvailability(id),
    enabled: !!id,
  });

  // Sync availability into editable slots when not editing
  const currentSlots = editingAvailability
    ? slots
    : (availability ?? []).map((s: AvailabilityRecord) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        slotDuration: s.slotDuration,
        isActive: s.isActive ?? true,
      }));

  const startEditing = () => {
    setSlots(
      (availability ?? []).map((s: AvailabilityRecord) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        slotDuration: s.slotDuration,
        isActive: s.isActive ?? true,
      }))
    );
    setEditingAvailability(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => updateDoctorAvailability(id, slots),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-availability", id] });
      setEditingAvailability(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const addSlot = () => {
    setSlots((prev) => [
      ...prev,
      { dayOfWeek: "1", startTime: "08:00:00", endTime: "17:00:00", slotDuration: 30, isActive: true },
    ]);
  };

  const removeSlot = (i: number) => setSlots((prev) => prev.filter((_, idx) => idx !== i));

  const updateSlot = (i: number, field: keyof AvailabilitySlot, value: string | number | boolean) => {
    setSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-up py-6 px-4">
      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <h2 className="font-display font-bold text-lg text-foreground tracking-tight">Doctor profile</h2>
      </div>

      {/* Hero card */}
      {isLoading ? (
        <div className="rounded-2xl bg-card border border-border p-6 flex items-center gap-5 mb-4">
          <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ) : doctor && (
        <div className="rounded-2xl bg-card border border-border p-5 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4 pointer-events-none" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-xl text-primary">
                {doctor.firstName?.[0]}{doctor.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-xl text-foreground mb-1 tracking-tight">
                Dr. {doctor.firstName} {doctor.lastName}
              </h3>
              {doctor.specialization && (
                <p className="text-sm text-primary mb-2">{doctor.specialization}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {([
                  { icon: <Building2 className="h-3 w-3" />, value: doctor.department },
                  { icon: <Hash className="h-3 w-3" />, value: doctor.licenseNumber },
                  { icon: <CreditCard className="h-3 w-3" />, value: doctor.consultationFee ? `KES ${Number(doctor.consultationFee).toLocaleString()}` : null },
                ] as { icon: React.ReactNode; value: string | null | undefined }[]).filter((i) => i.value).map(({ icon, value }) => (
                  <div key={String(value)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent border border-border text-xs text-muted-foreground">
                    <span className="text-muted-foreground">{icon}</span>
                    {value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Availability section */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-foreground">Availability schedule</p>
              <p className="text-xs text-muted-foreground mt-0.5">Weekly working hours</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-green-500 animate-fade-in">
                <CheckCircle className="h-3 w-3" /> Saved
              </div>
            )}
            {editingAvailability ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setEditingAvailability(false)}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={startEditing}>
                Edit schedule
              </Button>
            )}
          </div>
        </div>

        {avLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : !editingAvailability ? (
          currentSlots.length === 0 ? (
            <div className="flex items-center justify-center h-20 rounded-xl border border-dashed border-border text-muted-foreground text-sm">
              No schedule set — click "Edit schedule" to add working hours
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {currentSlots.map((slot, i) => {
                const day = DAYS.find((d) => d.value === slot.dayOfWeek)?.label ?? slot.dayOfWeek;
                return (
                  <div key={i} className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border",
                    slot.isActive ? "bg-accent border-border" : "bg-accent/50 border-border/50 opacity-50",
                  )}>
                    <div className="w-20 flex-shrink-0">
                      <p className="text-xs font-medium text-foreground">{day}</p>
                      {!slot.isActive && <p className="text-[10px] text-muted-foreground">Inactive</p>}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {slot.startTime.slice(0, 5)} – {slot.endTime.slice(0, 5)}
                    </div>
                    <span className="text-[11px] text-muted-foreground px-2 py-1 rounded-lg bg-card border border-border">
                      {slot.slotDuration} min slots
                    </span>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-3">
            {slots.map((slot, i) => (
              <div key={i} className="p-3 rounded-xl bg-accent border border-border flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Select
                      value={slot.dayOfWeek}
                      onValueChange={(value) => updateSlot(i, "dayOfWeek", value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Active</span>
                    <Switch
                      checked={slot.isActive}
                      onCheckedChange={(checked) => updateSlot(i, "isActive", checked)}
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSlot(i)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Start Time</Label>
                    <Input
                      type="time"
                      value={slot.startTime.slice(0, 5)}
                      onChange={(e) => updateSlot(i, "startTime", e.target.value + ":00")}
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">End Time</Label>
                    <Input
                      type="time"
                      value={slot.endTime.slice(0, 5)}
                      onChange={(e) => updateSlot(i, "endTime", e.target.value + ":00")}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Slot Duration</Label>
                  <Select
                    value={slot.slotDuration.toString()}
                    onValueChange={(value) => updateSlot(i, "slotDuration", parseInt(value))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {[15, 20, 30, 45, 60].map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          {m} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            
            <Button
              variant="outline"
              onClick={addSlot}
              className="w-full h-10 border-dashed gap-2"
            >
              <Plus className="h-4 w-4" /> Add day
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}