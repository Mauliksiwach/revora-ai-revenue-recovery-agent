import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index.js";
import { RevenueDetectiveService } from "../src/services/revenueDetectiveService.js";

describe("AI Revenue Detective — Unit Tests", () => {
  const detective = new RevenueDetectiveService();

  it("should run detection and return a DetectionResult structure", () => {
    const result = detective.runDetection();

    expect(result).toHaveProperty("incidents");
    expect(Array.isArray(result.incidents)).toBe(true);
    expect(result).toHaveProperty("totalRevenueAtRiskInr");
    expect(result).toHaveProperty("criticalCount");
    expect(result).toHaveProperty("highCount");
    expect(result).toHaveProperty("mediumCount");
    expect(result).toHaveProperty("lowCount");
    expect(result).toHaveProperty("smartSilenceActive");
    expect(result).toHaveProperty("analysisTimestamp");
    expect(result.isSynthetic).toBe(true);
  });

  it("should detect at least one incident in the synthetic dataset (HDFC spike present)", () => {
    const result = detective.runDetection();
    // The synthetic dataset always includes an HDFC UPI outage spike
    // so there must be at least one active incident
    expect(result.incidents.length).toBeGreaterThan(0);
  });

  it("should produce incidents with valid severity values", () => {
    const result = detective.runDetection();
    const validSeverities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    for (const incident of result.incidents) {
      expect(validSeverities).toContain(incident.severity);
    }
  });

  it("should produce incidents with confidence between 0 and 100", () => {
    const result = detective.runDetection();
    for (const incident of result.incidents) {
      expect(incident.aiConfidencePct).toBeGreaterThan(0);
      expect(incident.aiConfidencePct).toBeLessThanOrEqual(100);
    }
  });

  it("should produce incidents with non-empty aiDiagnosis and recommendation", () => {
    const result = detective.runDetection();
    for (const incident of result.incidents) {
      expect(incident.aiDiagnosis.length).toBeGreaterThan(20);
      expect(incident.recommendation.length).toBeGreaterThan(20);
    }
  });

  it("should always provide at least one evidence item per incident", () => {
    const result = detective.runDetection();
    for (const incident of result.incidents) {
      expect(incident.evidence.length).toBeGreaterThan(0);
    }
  });

  it("should correctly count severity buckets", () => {
    const result = detective.runDetection();
    const manualCritical = result.incidents.filter((i) => i.severity === "CRITICAL").length;
    const manualHigh = result.incidents.filter((i) => i.severity === "HIGH").length;
    expect(result.criticalCount).toBe(manualCritical);
    expect(result.highCount).toBe(manualHigh);
  });

  it("should set smartSilenceActive = true when a CRITICAL/HIGH issuer outage incident exists", () => {
    const result = detective.runDetection();
    const hasCriticalOrHigh = result.incidents.some(
      (i) => i.smartSilenceRecommended && (i.severity === "CRITICAL" || i.severity === "HIGH")
    );
    if (hasCriticalOrHigh) {
      expect(result.smartSilenceActive).toBe(true);
    }
  });
});

describe("AI Revenue Detective — API Endpoint Tests", () => {
  it("GET /api/v1/intelligence/detect should return detection results", async () => {
    const res = await request(app).get("/api/v1/intelligence/detect");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("incidents");
    expect(res.body.data).toHaveProperty("totalRevenueAtRiskInr");
    expect(res.body.data).toHaveProperty("smartSilenceActive");
  });

  it("GET /api/v1/intelligence/detect incidents should have required fields", async () => {
    const res = await request(app).get("/api/v1/intelligence/detect");
    expect(res.status).toBe(200);
    for (const incident of res.body.data.incidents) {
      expect(incident).toHaveProperty("id");
      expect(incident).toHaveProperty("title");
      expect(incident).toHaveProperty("severity");
      expect(incident).toHaveProperty("aiDiagnosis");
      expect(incident).toHaveProperty("aiConfidencePct");
      expect(incident).toHaveProperty("evidence");
      expect(incident).toHaveProperty("recommendation");
      expect(incident).toHaveProperty("affectedRevenueInr");
    }
  });

  it("GET /api/v1/intelligence/incidents/:id should return 404 for unknown ID", async () => {
    const res = await request(app).get("/api/v1/intelligence/incidents/non_existent_incident_999");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});