import { describe, it, expect } from "vitest";
import { validateRegistration, EMPTY_FIELDS } from "@/lib/validation";

const valid = {
  ...EMPTY_FIELDS,
  fullName: "Jane Aviator",
  email: "jane@example.com",
  phone: "+386 1 234 567",
};

describe("validateRegistration", () => {
  it("requires name, email and phone", () => {
    const e = validateRegistration(EMPTY_FIELDS, "brushup");
    expect(e.fullName).toBeDefined();
    expect(e.email).toBeDefined();
    expect(e.phone).toBeDefined();
  });

  it("rejects a malformed email", () => {
    const e = validateRegistration(
      { ...valid, email: "not-an-email" },
      "brushup",
    );
    expect(e.email).toBeDefined();
  });

  it("accepts a complete brush-up registration (no subject/slot needed)", () => {
    const e = validateRegistration(valid, "brushup");
    expect(Object.keys(e)).toHaveLength(0);
  });

  it("requires subject and slot for the exam variant", () => {
    const e = validateRegistration(valid, "exam");
    expect(e.subject).toBeDefined();
    expect(e.slot).toBeDefined();
  });

  it("accepts a complete exam booking", () => {
    const e = validateRegistration(
      { ...valid, subject: "010", slot: "2026-07-10-am" },
      "exam",
    );
    expect(Object.keys(e)).toHaveLength(0);
  });
});
