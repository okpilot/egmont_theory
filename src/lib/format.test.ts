import { describe, it, expect } from "vitest";
import { formatSessionDate } from "@/lib/format";

describe("formatSessionDate", () => {
  it("formats an ISO date as 'Wkd D Mon YYYY'", () => {
    expect(formatSessionDate("2026-07-06")).toBe("Mon 6 Jul 2026");
  });

  it("uses no leading zero on the day and the short month", () => {
    expect(formatSessionDate("2026-08-03")).toBe("Mon 3 Aug 2026");
    expect(formatSessionDate("2026-12-25")).toBe("Fri 25 Dec 2026");
  });
});
