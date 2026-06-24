import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  type Option,
  type BrushUpSession,
  brushUpSessions,
  examSubjects,
  examSlots,
  school,
} from "@/config/site";
import { formatSessionDate } from "@/lib/format";
import { submitRegistration, type SubmitResult } from "@/lib/submit";
import {
  type FieldState,
  type Variant,
  EMPTY_FIELDS as EMPTY,
  validateRegistration,
} from "@/lib/validation";

interface Props {
  variant: Variant;
}

export default function RegistrationForm({ variant }: Props) {
  const [session, setSession] = useState<BrushUpSession | null>(null);
  const [values, setValues] = useState<FieldState>(EMPTY);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FieldState, string>>
  >({});
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [result, setResult] = useState<SubmitResult | null>(null);

  const set = (key: keyof FieldState, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  /* ---- Success screen --------------------------------------------------- */
  if (result?.ok) {
    return (
      <SuccessScreen
        variant={variant}
        firstName={values.fullName.split(" ")[0] || "there"}
        reference={result.reference}
        demo={result.demo}
        onReset={() => {
          setResult(null);
          setValues(EMPTY);
          setSession(null);
        }}
      />
    );
  }

  /* ---- Brush-up: schedule (step 1) -------------------------------------- */
  if (variant === "brushup" && !session) {
    return <Schedule onPick={(s) => setSession(s)} />;
  }

  /* ---- Validation + submit --------------------------------------------- */
  const validate = (): boolean => {
    const e = validateRegistration(values, variant);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (status === "submitting") return;
    if (!validate()) return;

    setStatus("submitting");

    const common = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      dateOfBirth: values.dateOfBirth || null,
      studentId: values.studentId.trim() || null,
      notes: values.notes.trim() || null,
    };

    let payload: Record<string, unknown>;
    let refPrefix: string;

    if (variant === "brushup" && session) {
      refPrefix = "BU";
      payload = {
        type: "brushup_registration",
        ...common,
        sessionDate: session.date,
        sessionTime: session.time,
        subjects: session.subjects.join(", "),
        location: session.location ?? school.defaultLocation,
      };
    } else {
      refPrefix = "EXM";
      const subjectLabel =
        examSubjects.find((c) => c.id === values.subject)?.label ??
        values.subject;
      const slotLabel =
        examSlots.find((s) => s.id === values.slot)?.label ?? values.slot;
      payload = {
        type: "exam_booking",
        ...common,
        subject: subjectLabel,
        slot: slotLabel,
      };
    }

    const res = await submitRegistration(refPrefix, payload);
    setStatus("idle");
    setResult(res);
    if (res.ok) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---- Form (step 2 for brush-up; single step for exam) ----------------- */
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      {result && !result.ok && (
        <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {result.error}
        </div>
      )}

      {variant === "brushup" && session && (
        <SessionSummary session={session} onChange={() => setSession(null)} />
      )}

      {/* Student details */}
      <fieldset className="space-y-5">
        <legend className="text-xs font-semibold tracking-widest text-primary uppercase">
          Your details
        </legend>

        <Field
          label="Full name"
          htmlFor="fullName"
          required
          error={errors.fullName}
        >
          <Input
            id="fullName"
            value={values.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Jane Aviator"
            aria-invalid={!!errors.fullName}
            autoComplete="name"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" htmlFor="email" required error={errors.email}>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="jane@example.com"
              aria-invalid={!!errors.email}
              autoComplete="email"
            />
          </Field>
          <Field label="Phone" htmlFor="phone" required error={errors.phone}>
            <Input
              id="phone"
              type="tel"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+00 000 000 000"
              aria-invalid={!!errors.phone}
              autoComplete="tel"
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Date of birth" htmlFor="dob" hint="optional">
            <Input
              id="dob"
              type="date"
              value={values.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
            />
          </Field>
          <Field
            label="Student / licence ID"
            htmlFor="studentId"
            hint="optional"
          >
            <Input
              id="studentId"
              value={values.studentId}
              onChange={(e) => set("studentId", e.target.value)}
              placeholder="If you already have one"
            />
          </Field>
        </div>
      </fieldset>

      {/* Exam-only selection */}
      {variant === "exam" && (
        <fieldset className="mt-8 space-y-5">
          <legend className="text-xs font-semibold tracking-widest text-primary uppercase">
            Exam selection
          </legend>

          <Field
            label="Exam subject"
            htmlFor="subject"
            required
            error={errors.subject}
          >
            <Select
              value={values.subject}
              onValueChange={(v) => set("subject", v ?? "")}
            >
              <SelectTrigger
                id="subject"
                className="w-full"
                aria-invalid={!!errors.subject}
              >
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {examSubjects.map((o: Option) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Exam date" htmlFor="slot" required error={errors.slot}>
            <Select
              value={values.slot}
              onValueChange={(v) => set("slot", v ?? "")}
            >
              <SelectTrigger
                id="slot"
                className="w-full"
                aria-invalid={!!errors.slot}
              >
                <SelectValue placeholder="Select an available slot" />
              </SelectTrigger>
              <SelectContent>
                {examSlots.map((o: Option) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </fieldset>
      )}

      <div className="mt-8 space-y-5">
        <Field label="Notes for the office" htmlFor="notes" hint="optional">
          <Textarea
            id="notes"
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Anything we should know — accessibility needs, scheduling constraints, etc."
            rows={3}
          />
        </Field>
      </div>

      <Button
        type="submit"
        className="mt-8 w-full"
        disabled={status === "submitting"}
      >
        {status === "submitting"
          ? "Submitting…"
          : variant === "brushup"
            ? "Confirm registration"
            : "Book exam"}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        By submitting you agree to be contacted about your registration.
      </p>
    </form>
  );
}

/* ========================================================================= */
/*  Schedule (agenda list)                                                   */
/* ========================================================================= */
function Schedule({ onPick }: { onPick: (s: BrushUpSession) => void }) {
  const sessions = useMemo(
    () => [...brushUpSessions].sort((a, b) => a.date.localeCompare(b.date)),
    [],
  );

  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-lg font-semibold">Upcoming sessions</h2>
        <span className="text-sm text-muted-foreground">
          {sessions.length} scheduled
        </span>
      </div>

      <ul className="space-y-4">
        {sessions.map((s) => {
          const full = s.seats <= 0;
          return (
            <li
              key={s.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <DateBadge iso={s.date} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {s.subjects.map((sub) => (
                      <span
                        key={sub}
                        className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {s.time} · {s.location ?? school.defaultLocation}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                    {full ? (
                      <span className="text-destructive">Fully booked</span>
                    ) : (
                      <span>
                        {s.seats} seat{s.seats === 1 ? "" : "s"} left
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Button
                className="shrink-0"
                disabled={full}
                onClick={() => onPick(s)}
              >
                {full ? "Full" : "Register"}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DateBadge({ iso }: { iso: string }) {
  const d = new Date(`${iso}T00:00:00`);
  const day = d.toLocaleDateString("en-GB", { day: "2-digit" });
  const month = d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
  const weekday = d
    .toLocaleDateString("en-GB", { weekday: "short" })
    .toUpperCase();
  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
      <span className="text-[0.6rem] font-medium tracking-wide opacity-80">
        {weekday}
      </span>
      <span className="text-xl leading-none font-bold">{day}</span>
      <span className="text-[0.6rem] font-medium tracking-wide opacity-80">
        {month}
      </span>
    </div>
  );
}

/* ========================================================================= */
/*  Selected-session summary (top of the form)                               */
/* ========================================================================= */
function SessionSummary({
  session,
  onChange,
}: {
  session: BrushUpSession;
  onChange: () => void;
}) {
  return (
    <div className="mb-8 rounded-lg border border-primary/20 bg-accent/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Your brush-up session
          </p>
          <p className="mt-1 font-semibold">
            {formatSessionDate(session.date)} · {session.time}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.subjects.join(" · ")}
          </p>
        </div>
        <button
          type="button"
          onClick={onChange}
          className="shrink-0 text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          Change
        </button>
      </div>
    </div>
  );
}

/* ========================================================================= */
/*  Success screen                                                           */
/* ========================================================================= */
function SuccessScreen({
  variant,
  firstName,
  reference,
  demo,
  onReset,
}: {
  variant: Variant;
  firstName: string;
  reference: string;
  demo: boolean;
  onReset: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8"
        >
          <path d="m5 13 4 4L19 7" />
        </svg>
      </div>
      <h2 className="mt-5 text-2xl font-semibold">Registration received</h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        Thanks, {firstName}. We've recorded your{" "}
        {variant === "brushup" ? "brush-up registration" : "exam booking"} and
        the office will confirm by email shortly.
      </p>
      <p className="mt-5 text-sm text-muted-foreground">Your reference</p>
      <p className="mt-1 inline-block rounded-md bg-accent px-4 py-2 font-mono text-lg font-semibold text-accent-foreground">
        {reference}
      </p>

      {demo && (
        <div className="mx-auto mt-6 max-w-md rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
          <strong>Demo mode:</strong> no backend is configured, so nothing was
          actually sent. The submission was logged to the browser console. See
          the README to connect NocoDB.
        </div>
      )}

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button variant="outline" onClick={onReset}>
          Register another
        </Button>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}

/* ========================================================================= */
/*  Small labelled-field wrapper                                             */
/* ========================================================================= */
function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
