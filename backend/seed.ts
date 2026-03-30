/**
 * seed.ts  —  DACS comprehensive database seed
 *
 * Usage (from DACS-main/backend/):
 *   npx tsx seed.ts
 *
 * KEY FIX: Uses drizzle-orm/neon-http + casing:"snake_case" to match index.ts exactly.
 * The previous version used node-postgres without snake_case casing, which caused
 * Drizzle to emit camelCase column names ("userId") instead of snake_case ("user_id").
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import {
  users, patients, doctors, doctorAvailability,
  appointments, appointmentHistory, medicalRecords,
  prescriptions, bills, insuranceClaims, activityLogs, systemMetrics,
} from "./src/db/schema";

// ── DB: mirrors index.ts exactly ──────────────────────────────────────────────
const sql = neon(process.env.DATABASE_URL!);
const db  = drizzle(sql, { casing: "snake_case" });

// ── helpers ────────────────────────────────────────────────────────────────────
const pick  = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] =>
  [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const rand    = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const fmt2    = (n: number) => String(n).padStart(2, "0");
const fmtDate = (d: Date)   => d.toISOString().split("T")[0];
const dateOffset = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };
const pastDate   = (n: number) => dateOffset(-rand(1, n));
const futureDate = (n: number) => dateOffset(rand(1, n));
const slot = (h: number, m = 0) => `${fmt2(h)}:${fmt2(m)}:00`;

// ── reference data ─────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  "Amara","Brian","Cynthia","David","Esther","Farrukh","Grace","Hassan","Ivy","James",
  "Keisha","Liam","Mwende","Njoroge","Olivia","Patrick","Queenie","Robert","Salome","Titus",
  "Ursula","Victor","Wanjiku","Xander","Yusuf","Zara","Abel","Betty","Calvin","Dorothy",
  "Emmanuel","Faith","George","Hannah","Isaiah","Janet","Kevin","Lydia","Martin","Nancy",
  "Oscar","Priscilla","Quentin","Ruth","Samuel","Teresa","Umar","Violet","William","Ximena",
];
const LAST_NAMES = [
  "Odhiambo","Mwangi","Kamau","Otieno","Njeri","Kipchoge","Waweru","Mutua",
  "Karanja","Achieng","Nzau","Kimani","Ouma","Chebet","Maina","Koech",
  "Ndegwa","Owino","Githinji","Mugo","Abubakar","Simiyu","Muthoni","Kagwe",
];
const INSURERS       = ["AAR Insurance","Jubilee Insurance","CIC Insurance","Britam","Resolution Insurance","GA Insurance"];
const PHONE_PFX      = ["0701","0711","0722","0733","0745","0757"];
const DIAGNOSES      = [
  "Hypertension","Type 2 Diabetes","Malaria","Typhoid Fever","Upper Respiratory Tract Infection",
  "Asthma","Anaemia","Urinary Tract Infection","Peptic Ulcer Disease","Pneumonia",
  "Migraine","Osteoarthritis","Depression","Anxiety Disorder","Acute Gastroenteritis",
  "Tuberculosis","HIV/AIDS (stable on ART)","Chronic Kidney Disease","Heart Failure","Eczema",
];
const SYMPTOMS = [
  "Fever, headache, body aches","Increased thirst, frequent urination, fatigue",
  "Chest tightness, wheezing, shortness of breath","Nausea, vomiting, diarrhoea",
  "Painful urination, cloudy urine","Persistent cough, night sweats, weight loss",
  "Severe headache, photophobia, nausea","Joint pain, stiffness, reduced mobility",
  "Epigastric pain, bloating, heartburn","Fatigue, pallor, dizziness",
];
const RX_LIST = [
  { med:"Amoxicillin 500mg",       dosage:"500mg",       freq:"Three times daily",           dur:"7 days",  instr:"Take with food. Complete the full course." },
  { med:"Metformin 500mg",         dosage:"500mg",       freq:"Twice daily",                 dur:"30 days", instr:"Take with meals. Monitor blood glucose." },
  { med:"Amlodipine 5mg",          dosage:"5mg",         freq:"Once daily",                  dur:"30 days", instr:"Take at the same time each day." },
  { med:"Artemether-Lumefantrine", dosage:"80/480mg",    freq:"Twice daily",                 dur:"3 days",  instr:"Take with food or milk. Complete the full course." },
  { med:"Salbutamol Inhaler",      dosage:"100mcg/puff", freq:"As needed (max 4x/day)",      dur:"Ongoing", instr:"Shake well before use. Rinse mouth after use." },
  { med:"Omeprazole 20mg",         dosage:"20mg",        freq:"Once daily before breakfast", dur:"14 days", instr:"Take 30 minutes before eating." },
  { med:"Ciprofloxacin 500mg",     dosage:"500mg",       freq:"Twice daily",                 dur:"5 days",  instr:"Drink plenty of water. Avoid antacids." },
  { med:"Ferrous Sulphate 200mg",  dosage:"200mg",       freq:"Once daily",                  dur:"90 days", instr:"Take on an empty stomach with water or orange juice." },
  { med:"Paracetamol 500mg",       dosage:"500mg",       freq:"Every 6 hours as needed",     dur:"5 days",  instr:"Do not exceed 4g in 24 hours." },
  { med:"Lisinopril 10mg",         dosage:"10mg",        freq:"Once daily",                  dur:"30 days", instr:"Monitor blood pressure. Avoid potassium supplements." },
  { med:"Prednisolone 5mg",        dosage:"5mg",         freq:"Once daily in morning",       dur:"7 days",  instr:"Do not stop abruptly. Take with food." },
  { med:"Cotrimoxazole 960mg",     dosage:"960mg",       freq:"Once daily",                  dur:"30 days", instr:"Take with food. Drink plenty of fluids." },
];
const NOTES = [
  "Patient responding well to treatment. Follow-up in 2 weeks.",
  "Advised lifestyle modifications including diet and exercise.",
  "Blood pressure controlled. Continue current medication.",
  "Referred for specialist review.",
  "Patient to return if symptoms worsen.",
  "Lab investigations requested. Results awaited.",
  "Counselled on medication compliance.",
  "Patient education provided on condition management.",
];
const REASONS = [
  "Routine check-up","Follow-up on chronic condition","Fever and malaise","Chest pain",
  "Persistent cough","Abdominal pain","Headache","Joint pain","Skin rash",
  "Blood pressure review","Diabetes review","Annual physical","Medication refill","Lab result review",
];
const PAY_METHODS = ["cash","mpesa","insurance","card","bank_transfer"];
const DOCTOR_PROFILES = [
  { first:"Amina",     last:"Hassan",   spec:"General Practice",         dept:"Outpatient",           fee:"2500.00", lic:"KMB-10234" },
  { first:"Daniel",    last:"Mwangi",   spec:"Internal Medicine",        dept:"Internal Medicine",    fee:"4500.00", lic:"KMB-10345" },
  { first:"Priscilla", last:"Kamau",    spec:"Paediatrics",              dept:"Paediatrics",          fee:"3500.00", lic:"KMB-10456" },
  { first:"John",      last:"Otieno",   spec:"Obstetrics & Gynaecology", dept:"Maternity",            fee:"5000.00", lic:"KMB-10567" },
  { first:"Sarah",     last:"Njeri",    spec:"Surgery",                  dept:"Surgery",              fee:"6000.00", lic:"KMB-10678" },
  { first:"Michael",   last:"Kipchoge", spec:"Cardiology",               dept:"Cardiology",           fee:"7000.00", lic:"KMB-10789" },
  { first:"Fatuma",    last:"Waweru",   spec:"Dermatology",              dept:"Dermatology",          fee:"3000.00", lic:"KMB-10890" },
  { first:"Kevin",     last:"Mutua",    spec:"Psychiatry",               dept:"Mental Health",        fee:"4000.00", lic:"KMB-10901" },
  { first:"Grace",     last:"Karanja",  spec:"Orthopaedics",             dept:"Orthopaedics",         fee:"5500.00", lic:"KMB-11012" },
  { first:"James",     last:"Achieng",  spec:"Emergency Medicine",       dept:"Accident & Emergency", fee:"3500.00", lic:"KMB-11123" },
];

// 30-min time slots 08:00 - 17:00
const TIME_SLOTS: Array<[string, string]> = [];
for (let h = 8; h < 17; h++) {
  TIME_SLOTS.push([slot(h, 0),  slot(h, 30)]);
  TIME_SLOTS.push([slot(h, 30), slot(h + 1, 0)]);
}

// ── MAIN ───────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("Seeding DACS database...\n");

  const PASSWORD  = await bcrypt.hash("Patient@1234", 10);
  const DOCTOR_PW = await bcrypt.hash("Doctor@1234",  10);

  // 1. Doctors
  console.log("Inserting 10 doctors...");
  const doctorIds: string[] = [];

  for (const p of DOCTOR_PROFILES) {
    const userId = uuidv4();
    doctorIds.push(userId);

    await db.insert(users).values({
      userId,
      email:    `dr.${p.first.toLowerCase()}.${p.last.toLowerCase()}@dacs.hospital`,
      phone:    `${pick(PHONE_PFX)}${rand(100000, 999999)}`,
      password: DOCTOR_PW,
      role:     "doctor",
      isActive: true,
    });

    await db.insert(doctors).values({
      doctorId:        userId,
      firstName:       p.first,
      lastName:        p.last,
      specialization:  p.spec,
      licenseNumber:   p.lic,
      department:      p.dept,
      consultationFee: p.fee,
    });

    for (const day of ["1","2","3","4","5"] as const) {
      await db.insert(doctorAvailability).values({
        doctorAvailabilityId: uuidv4(),
        doctorId:    userId,
        dayOfWeek:   day,
        startTime:   "08:00:00",
        endTime:     "17:00:00",
        slotDuration: 30,
        isActive:    true,
      });
    }

    console.log(`  Dr. ${p.first} ${p.last} (${p.spec})`);
  }

  // 2. Patients
  console.log("\nInserting 50 patients...");
  const patientIds: string[]                    = [];
  const patientInsurer: Map<string, string|null> = new Map();

  for (let i = 0; i < 50; i++) {
    const userId    = uuidv4();
    patientIds.push(userId);
    const firstName = FIRST_NAMES[i];
    const lastName  = pick(LAST_NAMES);
    const insurer   = Math.random() > 0.4 ? pick(INSURERS) : null;
    patientInsurer.set(userId, insurer);

    await db.insert(users).values({
      userId,
      email:    `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`,
      phone:    `${pick(PHONE_PFX)}${rand(100000, 999999)}`,
      password: PASSWORD,
      role:     "patient",
      isActive: true,
    });

    await db.insert(patients).values({
      patientId:             userId,
      firstName,
      lastName,
      dateOfBirth:           fmtDate(new Date(rand(1950, 2005), rand(0, 11), rand(1, 28))),
      gender:                pick(["male","female","other"] as const),
      nationalId:            String(rand(10000000, 99999999)),
      insuranceProvider:     insurer,
      insuranceNumber:       insurer ? `INS-${rand(100000, 999999)}` : null,
      emergencyContactName:  `${pick(FIRST_NAMES)} ${lastName}`,
      emergencyContactPhone: `${pick(PHONE_PFX)}${rand(100000, 999999)}`,
      address:               `${rand(1,999)} ${pick(["Ngong Rd","Mombasa Rd","Waiyaki Way","Thika Rd","Langata Rd"])}, Nairobi`,
    });
  }
  console.log("  50 patients inserted");

  // 3. Appointments + records + bills
  console.log("\nGenerating appointments, records, bills, prescriptions...");
  let apptCount = 0, recordCount = 0, billCount = 0, prescCount = 0, claimCount = 0;

  for (const patientId of patientIds) {
    const numAppts    = rand(2, 6);
    const myDoctorIds = pickN(doctorIds, 3);

    for (let a = 0; a < numAppts; a++) {
      const doctorId = pick(myDoctorIds);
      const isFuture = a === numAppts - 1 && Math.random() > 0.4;
      const apptDate = isFuture ? fmtDate(futureDate(60)) : fmtDate(pastDate(180));
      const [startTime, endTime] = pick(TIME_SLOTS);
      const apptType = pick(["regular","follow_up","emergency","consultation","procedure"] as const);

      let status: "scheduled"|"confirmed"|"in_progress"|"completed"|"cancelled"|"no_show"|"rescheduled";
      if (isFuture) {
        status = pick(["scheduled","confirmed"]);
      } else {
        status = pick(["completed","completed","completed","completed","cancelled","no_show","rescheduled"]);
      }

      const appointmentId = uuidv4();

      await db.insert(appointments).values({
        appointmentId,
        patientId,
        doctorId,
        appointmentDate:    apptDate,
        appointmentTime:    startTime,
        endTime,
        appointmentStatus:  status,
        appointmentType:    apptType,
        reason:             pick(REASONS),
        notes:              status === "completed" ? pick(NOTES) : null,
        cancellationReason: status === "cancelled" ? "Patient requested cancellation" : null,
        reminderSent:       !isFuture,
      });
      apptCount++;

      if (status !== "scheduled") {
        await db.insert(appointmentHistory).values({
          appointmentHistoryId: uuidv4(),
          appointmentId,
          previousStatus: "scheduled",
          newStatus:      status,
          changedBy:      doctorId,
          changeReason:   status === "cancelled" ? "Patient requested cancellation" : "Status updated",
          changedAt:      new Date(apptDate),
        });
      }

      if (status === "completed") {
        const medicalRecordId = uuidv4();

        await db.insert(medicalRecords).values({
          medicalRecordId,
          patientId,
          doctorId,
          appointmentId,
          recordDate:   apptDate,
          diagnosis:    pick(DIAGNOSES),
          symptoms:     pick(SYMPTOMS),
          prescription: "See prescriptions",
          notes:        pick(NOTES),
          followUpDate: fmtDate(dateOffset(rand(7, 90))),
        });
        recordCount++;

        for (let p = 0; p < rand(1, 2); p++) {
          const rx = pick(RX_LIST);
          await db.insert(prescriptions).values({
            prescriptionId:  uuidv4(),
            medicalRecordId,
            medicationName:  rx.med,
            dosage:          rx.dosage,
            frequency:       rx.freq,
            duration:        rx.dur,
            instructions:    rx.instr,
          });
          prescCount++;
        }

        // Bill
        const doctorIdx       = doctorIds.indexOf(doctorId);
        const fee             = parseFloat(DOCTOR_PROFILES[doctorIdx]?.fee ?? "2500");
        const insurer         = patientInsurer.get(patientId);
        const insuranceCovered =
          insurer && Math.random() > 0.3 ? (fee * 0.8).toFixed(2) : "0.00";
        const patientPayable  = Math.max(0, fee - parseFloat(insuranceCovered)).toFixed(2);
        const billStatus      = pick(["paid","paid","paid","pending","partially_paid","insurance_pending"] as const);
        const billId          = uuidv4();

        await db.insert(bills).values({
          billId,
          appointmentId,
          patientId,
          amount:          fee.toFixed(2),
          insuranceCovered,
          patientPayable,
          billStatus,
          paymentMethod:   billStatus === "paid" ? pick(PAY_METHODS) : null,
          paymentDate:     billStatus === "paid" ? new Date(apptDate) : null,
        });
        billCount++;

        if (insurer && ["insurance_pending","partially_paid"].includes(billStatus)) {
          const amountClaimed = parseFloat(insuranceCovered) > 0 ? insuranceCovered : (fee * 0.8).toFixed(2);
          const approved      = billStatus === "partially_paid";

          await db.insert(insuranceClaims).values({
            insuranceClaimId:  uuidv4(),
            billId,
            claimNumber:       `CLM-${rand(100000, 999999)}`,
            insuranceProvider: insurer,
            amountClaimed,
            amountApproved:    approved ? (parseFloat(amountClaimed) * 0.9).toFixed(2) : null,
            status:            approved ? "approved" : "submitted",
            submittedDate:     apptDate,
            approvedDate:      approved ? fmtDate(dateOffset(-rand(1, 30))) : null,
          });
          claimCount++;
        }
      }
    }
  }

  // 4. Activity logs
  console.log("\nGenerating 200 activity log entries...");
  const allUsers = [...patientIds, ...doctorIds];
  const ACTIONS  = ["login","logout","view_record","update_appointment","create_prescription","generate_report","view_dashboard"];
  const ENTITIES = ["appointment","patient","bill","medical_record","prescription"];

  for (let i = 0; i < 200; i++) {
    await db.insert(activityLogs).values({
      activityLogId: uuidv4(),
      userId:        pick(allUsers),
      action:        pick(ACTIONS),
      entityType:    pick(ENTITIES),
      entityId:      uuidv4(),
      ipAddress:     `${rand(41,197)}.${rand(0,255)}.${rand(0,255)}.${rand(1,254)}`,
      userAgent:     pick([
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14) Safari/17",
        "Mozilla/5.0 (Linux; Android 13) Chrome/124 Mobile",
      ]),
      created_at: pastDate(90),
    });
  }

  // 5. System metrics
  console.log("Generating system metrics (91 days x 9 metrics)...");
  const METRICS = [
    "total_appointments","completed_appointments","cancelled_appointments",
    "total_revenue","insurance_claims_submitted","new_patients",
    "average_wait_time_minutes","bed_occupancy_rate","prescriptions_issued",
  ];

  for (let day = -90; day <= 0; day++) {
    for (const metric of METRICS) {
      let value: number;
      switch (metric) {
        case "total_appointments":         value = rand(8,  25);       break;
        case "completed_appointments":     value = rand(5,  20);       break;
        case "cancelled_appointments":     value = rand(0,  4);        break;
        case "total_revenue":              value = rand(20000,120000); break;
        case "insurance_claims_submitted": value = rand(2,  12);       break;
        case "new_patients":               value = rand(1,  8);        break;
        case "average_wait_time_minutes":  value = rand(10, 45);       break;
        case "bed_occupancy_rate":         value = rand(55, 95);       break;
        case "prescriptions_issued":       value = rand(10, 40);       break;
        default:                           value = rand(1,  100);
      }
      await db.insert(systemMetrics).values({
        systemMetricId: uuidv4(),
        metricName:     metric,
        metricValue:    value.toFixed(2),
        recordedAt:     dateOffset(day),
      });
    }
  }

  console.log("\n--- Seed complete ---");
  console.log(`Doctors              : ${DOCTOR_PROFILES.length}`);
  console.log(`Patients             : ${patientIds.length}`);
  console.log(`Appointments         : ${apptCount}`);
  console.log(`Medical records      : ${recordCount}`);
  console.log(`Prescriptions        : ${prescCount}`);
  console.log(`Bills                : ${billCount}`);
  console.log(`Insurance claims     : ${claimCount}`);
  console.log(`Activity log entries : 200`);
  console.log(`System metrics       : ${91 * METRICS.length}`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});