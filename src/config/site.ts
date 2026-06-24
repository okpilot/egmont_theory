/* =============================================================================
 *  ATO PORTAL — CENTRAL CONFIGURATION
 *  Edit this one file to manage the school identity, the ATPL(A) brush-up
 *  schedule, the exam subjects/dates, and the backend that stores registrations.
 *  No database lives on the website itself.
 * ============================================================================= */

export interface Option {
  id: string;
  label: string;
}

export interface BrushUpSession {
  id: string;
  /** ISO date, e.g. "2026-07-06". */
  date: string;
  /** Start time, e.g. "09:00". */
  time: string;
  /** Subjects covered in this brush-up session (labels). */
  subjects: string[];
  /** Seats remaining (shown to students). Set 0 to mark full. */
  seats: number;
  /** Optional — defaults shown if omitted. */
  location?: string;
}

export interface BackendConfig {
  /** Where each registration is POSTed as JSON. "" = DEMO MODE (no network). */
  endpoint: string;
  /** Headers sent with every submission (e.g. NocoDB { "xc-token": "..." }). */
  headers: Record<string, string>;
  /**
   * How the JSON body is shaped for your backend:
   *  - "flat":    { fullName, email, ... }            (Supabase, Formspree, Baserow)
   *  - "nocodb":  { fullName, email, ... }            (NocoDB v2 single record)
   *  - "records": { records: [ { fullName, ... } ] }  (NocoDB v1 / some APIs)
   */
  payloadStyle: "flat" | "nocodb" | "records";
}

export const school = {
  name: "Egmont Aviation",
  shortName: "Egmont Aviation",
  tagline: "EASA Approved Training Organisation",
  contactName: "Oleksandr Konovalov",
  email: "okonovalov@egmont.group",
  phone: "+386 31 737 511",
  approvalRef: "SI.ATO.041",
  defaultLocation: "Egmont Aviation — Maribor Edvard Rusjan Airport (LJMB)",
};

/* ---- Backend wiring ----------------------------------------------------- *
 * While `endpoint` is "", the site runs in DEMO MODE: forms validate and show
 * the success screen but send nothing — the would-be payload is logged to the
 * browser console. Fill these in to go live. See README for NocoDB setup.
 * ------------------------------------------------------------------------- */
export const backend: BackendConfig = {
  endpoint: "",
  headers: {
    // "xc-token": "PASTE_NOCODB_TOKEN_HERE",
  },
  payloadStyle: "flat",
};

/* ---- EASA ATPL(A) theory subjects --------------------------------------- *
 * Used for the exam-booking dropdown. Brush-up sessions reference these by
 * label in their `subjects` array below.
 * ------------------------------------------------------------------------- */
export const atplSubjects: Option[] = [
  { id: "010", label: "010 Air Law" },
  { id: "021", label: "021 Airframe, Systems, Electrics, Power Plant" },
  { id: "022", label: "022 Instrumentation" },
  { id: "031", label: "031 Mass & Balance" },
  { id: "032", label: "032 Performance" },
  { id: "033", label: "033 Flight Planning & Monitoring" },
  { id: "040", label: "040 Human Performance & Limitations" },
  { id: "050", label: "050 Meteorology" },
  { id: "061", label: "061 General Navigation" },
  { id: "062", label: "062 Radio Navigation" },
  { id: "070", label: "070 Operational Procedures" },
  { id: "080", label: "080 Principles of Flight" },
  { id: "090", label: "090 VFR/IFR Communications" },
];

/* ---- ATPL(A) brush-up schedule ------------------------------------------ *
 * Each entry is one bookable brush-up session, already carrying its date and
 * the subject(s) it covers. Students see these as an agenda list and register.
 * Add/remove rows here; set `seats: 0` to show a session as full.
 * ------------------------------------------------------------------------- */
export const brushUpSessions: BrushUpSession[] = [
  {
    id: "bu-2026-07-06",
    date: "2026-07-06",
    time: "09:00",
    subjects: ["010 Air Law", "070 Operational Procedures"],
    seats: 4,
  },
  {
    id: "bu-2026-07-08",
    date: "2026-07-08",
    time: "09:00",
    subjects: ["050 Meteorology", "061 General Navigation"],
    seats: 6,
  },
  {
    id: "bu-2026-07-13",
    date: "2026-07-13",
    time: "09:00",
    subjects: ["032 Performance", "033 Flight Planning & Monitoring"],
    seats: 6,
  },
  {
    id: "bu-2026-07-20",
    date: "2026-07-20",
    time: "14:00",
    subjects: [
      "080 Principles of Flight",
      "021 Airframe, Systems, Electrics, Power Plant",
    ],
    seats: 8,
  },
  {
    id: "bu-2026-07-27",
    date: "2026-07-27",
    time: "09:00",
    subjects: ["062 Radio Navigation", "022 Instrumentation"],
    seats: 6,
  },
  {
    id: "bu-2026-08-03",
    date: "2026-08-03",
    time: "09:00",
    subjects: [
      "040 Human Performance & Limitations",
      "090 VFR/IFR Communications",
      "031 Mass & Balance",
    ],
    seats: 8,
  },
];

/* ---- Exam booking ------------------------------------------------------- */
export const examSubjects: Option[] = atplSubjects;

export const examSlots: Option[] = [
  { id: "2026-07-10-am", label: "Fri 10 Jul 2026 — 09:00" },
  { id: "2026-07-10-pm", label: "Fri 10 Jul 2026 — 14:00" },
  { id: "2026-07-24-am", label: "Fri 24 Jul 2026 — 09:00" },
  { id: "2026-08-14-am", label: "Fri 14 Aug 2026 — 09:00" },
];
