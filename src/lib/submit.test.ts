import { describe, it, expect, vi, afterEach } from "vitest";
import { submitRegistration } from "@/lib/submit";
import type { BackendConfig } from "@/config/site";

const demoCfg: BackendConfig = {
  endpoint: "",
  headers: {},
  payloadStyle: "flat",
};
const liveCfg: BackendConfig = {
  endpoint: "https://api.example/records",
  headers: { "xc-token": "secret" },
  payloadStyle: "flat",
};
const recordsCfg: BackendConfig = { ...liveCfg, payloadStyle: "records" };

const data = { type: "brushup_registration", fullName: "Jane" };

function okResponse() {
  return new Response(null, { status: 200 });
}

function bodyOf(spy: ReturnType<typeof vi.spyOn>) {
  const init = spy.mock.calls[0][1] as RequestInit;
  return JSON.parse(init.body as string);
}

describe("submitRegistration", () => {
  afterEach(() => vi.restoreAllMocks());

  it("demo mode: makes no network call and returns ok + demo with a BU- reference", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const res = await submitRegistration("BU", data, demoCfg);
    expect(res).toMatchObject({ ok: true, demo: true });
    expect(res.reference).toMatch(/^BU-[A-Z2-9]{6}$/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("flat style: POSTs the record flat with merged headers to the endpoint", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(okResponse());
    const res = await submitRegistration("BU", data, liveCfg);

    expect(res).toMatchObject({ ok: true, demo: false });
    expect(fetchSpy).toHaveBeenCalledOnce();

    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(fetchSpy.mock.calls[0][0]).toBe(liveCfg.endpoint);
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      "xc-token": "secret",
    });

    const body = bodyOf(fetchSpy);
    expect(body).toMatchObject({
      type: "brushup_registration",
      fullName: "Jane",
    });
    expect(body.reference).toMatch(/^BU-/);
    expect(body).not.toHaveProperty("records");
  });

  it("records style: wraps the record in { records: [ ... ] }", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(okResponse());
    await submitRegistration("BU", data, recordsCfg);

    const body = bodyOf(fetchSpy);
    expect(body).toHaveProperty("records");
    expect(body.records).toHaveLength(1);
    expect(body.records[0]).toMatchObject({ fullName: "Jane" });
  });

  it("non-OK response: returns ok:false with the status in the error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );
    const res = await submitRegistration("BU", data, liveCfg);
    expect(res.ok).toBe(false);
    expect(res.error).toContain("500");
  });

  it("fetch throws: returns a network-error result", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("boom"));
    const res = await submitRegistration("BU", data, liveCfg);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/network/i);
  });
});
