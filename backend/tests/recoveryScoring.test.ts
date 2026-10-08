import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index.js";
import { RecoveryScoringService } from "../src/services/recoveryScoringService.js";

describe("Recovery Opportunity Scoring Engine — Unit Tests", () => {
  const scoringSvc = new RecoveryScoringService();

  it("should return an OpportunitySummary with opportunities array and summary counts", () => {
    const summary = scoringSvc.getOpportunities();

    expect(summary).toHaveProperty("opportunities");
    expect(Array.isArray(summary.opportunities)).toBe(true);
    expect(summary.totalOpportunitiesCount).toBeGreaterThan(0);
    expect(summary.totalRevenueAtRiskInr).toBeGreaterThan(0);
    expect(summary.totalEstimatedRecoverableInr).toBeGreaterThan(0);
    expect(summary.highPriorityCount + summary.mediumPriorityCount + summary.lowPriorityCount).toBe(
      summary.totalOpportunitiesCount
    );
    expect(summary.isSynthetic).toBe(true);
  });

  it("should calculate recovery scores between 0 and 100 with valid score factors", () => {
    const summary = scoringSvc.getOpportunities();
    for (const opp of summary.opportunities) {
      expect(opp.recoveryScorePct).toBeGreaterThanOrEqual(0);
      expect(opp.recoveryScorePct).toBeLessThanOrEqual(100);
      expect(opp.estimatedRecoverableInr).toBeLessThanOrEqual(opp.amountInr);

      expect(opp.scoreFactors).toHaveProperty("categoryScore");
      expect(opp.scoreFactors).toHaveProperty("historyScore");
      expect(opp.scoreFactors).toHaveProperty("amountScore");
      expect(opp.scoreFactors).toHaveProperty("recencyScore");
    }
  });

  it("should assign strategies and rationales to all opportunities", () => {
    const summary = scoringSvc.getOpportunities();
    const validStrategies = [
      "IMMEDIATE_PAYMENT_LINK",
      "WHATSAPP_NUDGE",
      "EMAIL_RECOVERY",
      "SMART_RETRY",
      "CONCIERGE_OUTREACH",
      "SMART_SILENCE",
      "DO_NOT_CONTACT",
    ];

    for (const opp of summary.opportunities) {
      expect(validStrategies).toContain(opp.recommendedStrategy);
      expect(opp.strategyRationale.length).toBeGreaterThan(10);
    }
  });

  it("should correctly filter opportunities by priority", () => {
    const highOnly = scoringSvc.getOpportunities({ priority: "HIGH" });
    for (const opp of highOnly.opportunities) {
      expect(opp.priority).toBe("HIGH");
    }
  });

  it("should correctly filter opportunities by minimum score threshold", () => {
    const min80 = scoringSvc.getOpportunities({ minScore: 80 });
    for (const opp of min80.opportunities) {
      expect(opp.recoveryScorePct).toBeGreaterThanOrEqual(80);
    }
  });
});

describe("Recovery Opportunity Scoring Engine — API Endpoint Tests", () => {
  it("GET /api/v1/opportunities should return 200 with summary payload", async () => {
    const res = await request(app).get("/api/v1/opportunities");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("opportunities");
    expect(res.body.data).toHaveProperty("totalEstimatedRecoverableInr");
  });

  it("GET /api/v1/opportunities?priority=HIGH should filter high priority", async () => {
    const res = await request(app).get("/api/v1/opportunities?priority=HIGH");
    expect(res.status).toBe(200);
    for (const opp of res.body.data.opportunities) {
      expect(opp.priority).toBe("HIGH");
    }
  });

  it("GET /api/v1/opportunities/:id should return 404 for non-existent ID", async () => {
    const res = await request(app).get("/api/v1/opportunities/opp_non_existent_9999");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});