import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index.js";
import { RecoveryLabService } from "../src/services/recoveryLabService.js";

describe("Recovery Lab Strategy Simulator — Unit Tests", () => {
  const labSvc = new RecoveryLabService();

  it("should run simulation pass and return 6 strategy comparison results", () => {
    const result = labSvc.runSimulation();

    expect(result).toHaveProperty("scenarioName");
    expect(result).toHaveProperty("totalRevenueAtRiskInr");
    expect(result).toHaveProperty("strategyResults");
    expect(Array.isArray(result.strategyResults)).toBe(true);
    expect(result.strategyResults.length).toBe(6);
    expect(result.recommendedStrategy).toBe("REVORA_AI_ADAPTIVE");
    expect(result.revoraRevenueAdvantageInr).toBeGreaterThan(0);
    expect(result.isSynthetic).toBe(true);
  });

  it("should rank Revora AI Adaptive as the recommended strategy with highest recovered revenue", () => {
    const result = labSvc.runSimulation();
    const revora = result.strategyResults.find((s) => s.strategyType === "REVORA_AI_ADAPTIVE");

    expect(revora).toBeDefined();
    expect(revora?.isRecommended).toBe(true);
    expect(revora?.unnecessaryContactsPreventedCount).toBeGreaterThan(0);
  });

  it("should calculate valid metrics (recovery rate %, costs, ROI) across all strategies", () => {
    const result = labSvc.runSimulation();
    for (const strat of result.strategyResults) {
      expect(strat.recoveryRatePct).toBeGreaterThanOrEqual(0);
      expect(strat.recoveryRatePct).toBeLessThanOrEqual(100);
      expect(strat.outreachCostInr).toBeGreaterThanOrEqual(0);
      expect(strat.netRevenueRoiMultiplier).toBeGreaterThanOrEqual(0);
    }
  });

  it("should respond to outage severity parameter overrides", () => {
    const mild = labSvc.runSimulation({ outageSeverity: "MILD" });
    const severe = labSvc.runSimulation({ outageSeverity: "SEVERE" });

    const naiveMild = mild.strategyResults.find((s) => s.strategyType === "IMMEDIATE_NAIVE_RETRY")!;
    const naiveSevere = severe.strategyResults.find((s) => s.strategyType === "IMMEDIATE_NAIVE_RETRY")!;

    expect(naiveSevere.recoveredRevenueInr).toBeLessThan(naiveMild.recoveredRevenueInr);
  });
});

describe("Recovery Lab — API Endpoint Tests", () => {
  it("POST /api/v1/lab/simulate should return 200 with simulation results", async () => {
    const res = await request(app).post("/api/v1/lab/simulate").send({ outageSeverity: "MILD" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("strategyResults");
  });

  it("GET /api/v1/lab/strategies should return strategy metadata list", async () => {
    const res = await request(app).get("/api/v1/lab/strategies");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});