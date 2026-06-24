import { backend, type BackendConfig } from "@/config/site";

export interface SubmitResult {
  ok: boolean;
  demo: boolean;
  reference: string;
  error?: string;
}

/** Short human-friendly reference, e.g. "BU-7F3A2K". */
function makeReference(prefix: string): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${s}`;
}

/**
 * Sends a registration to the configured backend. Backend-agnostic: the
 * payload shape is controlled by `backend.payloadStyle` in the config.
 * When no endpoint is configured, runs in demo mode (logs, no network call).
 */
export async function submitRegistration(
  refPrefix: string,
  data: Record<string, unknown>,
  cfg: BackendConfig = backend,
): Promise<SubmitResult> {
  const reference = makeReference(refPrefix);
  const record = { ...data, reference, submittedAt: new Date().toISOString() };

  // Demo mode — nothing is configured yet.
  if (!cfg.endpoint) {
    console.info("[ATO demo mode] Registration captured (not sent):", record);
    return { ok: true, demo: true, reference };
  }

  const body = cfg.payloadStyle === "records" ? { records: [record] } : record;

  try {
    const res = await fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...cfg.headers },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return {
        ok: false,
        demo: false,
        reference,
        error: `Server responded ${res.status}. Please try again or contact the office.`,
      };
    }
    return { ok: true, demo: false, reference };
  } catch {
    return {
      ok: false,
      demo: false,
      reference,
      error: "Network error. Please check your connection and try again.",
    };
  }
}
