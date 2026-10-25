import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/index.js";
import { timelineService } from "../src/services/timelineService.js";

describe("Phase 7: Decision Timeline & Audit Ledger Service", () => {
  beforeEach(() => {
    timelineService.clearCache();
  });

  it("should generate structured audit events with cryptographic SHA-256 hashes", () => {
    const { data: events, total } = timelineService.getEvents({ limit: 10 });
    expect(total).toBeGreaterThan(0);
    expect(events.length).toBeLessThanOrEqual(10);

    const first = events[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("timestamp");
    expect(first).toHaveProperty("eventType");
    expect(first).toHaveProperty("actor");
    expect(first).toHaveProperty("auditHash");
    expect(first.auditHash).toMatch(/^[a-f0-9]{16}$/); // 16-char hex sha256 slice
  });

  it("should support filtering events by eventType", () => {
    const { data: allEvents } = timelineService.getEvents({ limit: 100 });
    const hasFail = allEvents.some((e) => e.eventType === "TRANSACTION_FAILED");

    if (hasFail) {
      const { data: filtered } = timelineService.getEvents({ eventType: "TRANSACTION_FAILED" });
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((e) => expect(e.eventType).toBe("TRANSACTION_FAILED"));
    }
  });

  it("should calculate valid AI performance proof metrics", () => {
    const proof = timelineService.getPerformanceProof();
    expect(proof.totalEvaluatedDecisions).toBeGreaterThanOrEqual(0);
    expect(proof.overallAccuracyRatePct).toBeGreaterThanOrEqual(0);
    expect(proof.overallAccuracyRatePct).toBeLessThanOrEqual(100);
    expect(proof.falsePositiveRatePct).toBeGreaterThanOrEqual(0);
    expect(proof.confidenceCalibration).toBeInstanceOf(Array);
    expect(proof.confidenceCalibration.length).toBe(4);
  });
});

describe("Phase 7: Timeline API Endpoints", () => {
  it("GET /api/v1/timeline/events should return 200 with paginated events", async () => {
    const res = await request(app).get("/api/v1/timeline/events?page=1&limit=5");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("page", 1);
    expect(res.body).toHaveProperty("limit", 5);
  });

  it("GET /api/v1/timeline/proof should return 200 with AI performance statistics", async () => {
    const res = await request(app).get("/api/v1/timeline/proof");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalEvaluatedDecisions");
    expect(res.body).toHaveProperty("overallAccuracyRatePct");
    expect(res.body).toHaveProperty("netRoiMultiplier");
    expect(res.body).toHaveProperty("confidenceCalibration");
  });
});
