import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index.js";
import { SmartSilenceService } from "../src/services/smartSilenceService.js";

describe("Smart Silence & Incident Cooldown — Unit Tests", () => {
  const ssSvc = new SmartSilenceService();

  it("should return a SmartSilenceStatusSummary with switch health list and event log", () => {
    const summary = ssSvc.getStatusSummary();

    expect(summary).toHaveProperty("isGlobalSmartSilenceActive");
    expect(summary).toHaveProperty("activeDegradedSwitchesCount");
    expect(summary).toHaveProperty("totalShieldedTransactionsCount");
    expect(summary).toHaveProperty("totalShieldedRevenueInr");
    expect(Array.isArray(summary.switchHealthList)).toBe(true);
    expect(summary.switchHealthList.length).toBe(8); // HDFC, ICICI, SBI, AXIS, KOTAK, YES_BANK, PNB, BOB
    expect(summary.isSynthetic).toBe(true);
  });

  it("should evaluate bank switch health status correctly", () => {
    const summary = ssSvc.getStatusSummary();
    const validStatuses = ["HEALTHY", "DEGRADED", "OUTAGE"];
    for (const s of summary.switchHealthList) {
      expect(validStatuses).toContain(s.status);
      expect(s.failureRatePct).toBeGreaterThanOrEqual(0);
      expect(s.failureRatePct).toBeLessThanOrEqual(100);
    }
  });

  it("should toggle manual override for a specific bank switch", () => {
    const initial = ssSvc.getStatusSummary();
    const bankToToggle = "ICICI";
    const iciciBefore = initial.switchHealthList.find((s) => s.bank === bankToToggle);

    const toggled = ssSvc.toggleOverride(bankToToggle, true);
    expect(toggled.bank).toBe(bankToToggle);
    expect(toggled.isSuppressed).toBe(true);
    expect(toggled.suppressionReason).toContain("Manual Merchant Override");
  });

  it("should return event history log", () => {
    const events = ssSvc.getEventHistory();
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);
  });
});

describe("Smart Silence — API Endpoint Tests", () => {
  it("GET /api/v1/smartsilence/status should return 200 with status summary", async () => {
    const res = await request(app).get("/api/v1/smartsilence/status");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("isGlobalSmartSilenceActive");
    expect(res.body.data).toHaveProperty("switchHealthList");
  });

  it("POST /api/v1/smartsilence/override should toggle override for bank", async () => {
    const res = await request(app)
      .post("/api/v1/smartsilence/override")
      .send({ bank: "SBI", forceSuppressed: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bank).toBe("SBI");
    expect(res.body.data.isSuppressed).toBe(true);
  });

  it("POST /api/v1/smartsilence/override without bank should return 400", async () => {
    const res = await request(app).post("/api/v1/smartsilence/override").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});