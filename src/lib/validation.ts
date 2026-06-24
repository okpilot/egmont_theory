/* Pure, config-free validation for the registration forms — kept out of the
 * React component so it can be unit-tested directly. */

export type Variant = "brushup" | "exam";

export interface FieldState {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  studentId: string;
  subject: string; // exam only
  slot: string; // exam only
  notes: string;
}

export const EMPTY_FIELDS: FieldState = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  studentId: "",
  subject: "",
  slot: "",
  notes: "",
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors = Partial<Record<keyof FieldState, string>>;

/** Returns a map of field → error message. Empty object means valid. */
export function validateRegistration(
  values: FieldState,
  variant: Variant,
): FieldErrors {
  const e: FieldErrors = {};
  if (!values.fullName.trim()) e.fullName = "Please enter your full name.";
  if (!values.email.trim()) e.email = "Please enter your email.";
  else if (!EMAIL_RE.test(values.email))
    e.email = "Please enter a valid email address.";
  if (!values.phone.trim()) e.phone = "Please enter a contact phone number.";
  if (variant === "exam") {
    if (!values.subject) e.subject = "Please choose a subject.";
    if (!values.slot) e.slot = "Please choose an exam date.";
  }
  return e;
}
