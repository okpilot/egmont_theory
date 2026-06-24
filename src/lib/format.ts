/**
 * Format an ISO date (e.g. "2026-07-06") as "Mon 6 Jul 2026".
 *
 * Each part is formatted separately and joined with spaces on purpose: a single
 * combined `toLocaleDateString` call inserts a comma after the weekday under some
 * ICU builds (e.g. Node) but not others (e.g. Chrome), which would make the output
 * differ between the browser and the test/CI environment. Formatting per-part keeps
 * it deterministic everywhere.
 */
export function formatSessionDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" });
  const day = d.toLocaleDateString("en-GB", { day: "numeric" });
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  const year = d.toLocaleDateString("en-GB", { year: "numeric" });
  return `${weekday} ${day} ${month} ${year}`;
}
