import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index.js";
import { RevoraAgentService } from "../src/services/revoraAgentService.js";

describe("Revora Agent Core Engine — Unit Tests", () => {
  const agentSvc = new RevoraAgentService();

  it("should run agent cycle and produce AgentCycleSummary payload", () => {
    const summary = agentSvc.runAgentCycle();

    expect(summary).toHaveProperty("decisions");
    expect(Array.isArray(summary.decisions)).toBe(true);
    expect(summary.totalDecisionsCount).toBeGreaterThan(0);
    expect(summary).toHaveProperty("approvedCount");
    expect(summary).toHaveProperty("requiresHumanApprovalCount");
    expect(summary).toHaveProperty("executedRevenueInr");
    expect(summary.isSynthetic).toBe(true);
  });

  it("should enforce policy gate checks (cooldown, cap, high ticket, smart silence) on decisions", () => {
    const summary = agentSvc.runAgentCycle();
    for (const d of summary.decisions) {
      expect(d.policyCheck).toHaveProperty("cooldownPassed");
      expect(d.policyCheck).toHaveProperty("maxCapPassed");
      expect(d.policyCheck).toHaveProperty("highTicketCheckPassed");
      expect(d.policyCheck).toHaveProperty("smartSilenceCheckPassed");
      expect(d.reasoningNarrative.length).toBeGreaterThan(15);
    }
  });

  it("should route high-ticket transactions (>= ₹50,000) to REQUIRES_HUMAN_APPROVAL and PENDING_APPROVAL unless suppressed by Smart Silence", () => {
    const summary = agentSvc.runAgentCycle();
    const highTickets = summary.decisions.filter(
      (d) => d.amountInr >= 50000 && d.policyStatus !== "SUPPRESSED_SMART_SILENCE"
    );

    for (const d of highTickets) {
      expect(d.policyStatus).toBe("REQUIRES_HUMAN_APPROVAL");
      expect(d.executionState).toBe("PENDING_APPROVAL");
    }
  });

  it("should allow approving a pending decision", () => {
    const summary = agentSvc.runAgentCycle();
    const pending = summary.decisions.find((d) => d.executionState === "PENDING_APPROVAL");

    if (pending) {
      const approved = agentSvc.approveDecision(pending.id);
      expect(approved).not.toBeNull();
      expect(approved?.executionState).toBe("EXECUTED");
      expect(approved?.executedAt).toBeDefined();
    }
  });

  it("should allow rejecting a pending decision", () => {
    const summary = agentSvc.runAgentCycle();
    const pending = summary.decisions.find((d) => d.executionState === "PENDING_APPROVAL");

    if (pending) {
      const rejected = agentSvc.rejectDecision(pending.id);
      expect(rejected).not.toBeNull();
      expect(rejected?.executionState).toBe("REJECTED");
    }
  });
});

describe("Revora Agent Core Engine — API Endpoint Tests", () => {
  it("GET /api/v1/agent/decisions should return agent decision feed", async () => {
    const res = await request(app).get("/api/v1/agent/decisions");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("decisions");
    expect(res.body.data).toHaveProperty("totalDecisionsCount");
  });

  it("POST /api/v1/agent/run should trigger fresh agent cycle", async () => {
    const res = await request(app).post("/api/v1/agent/run");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("cycleTimestamp");
  });

  it("POST /api/v1/agent/approve/:id should approve a pending decision or return 404", async () => {
    const res = await request(app).post("/api/v1/agent/approve/dec_non_existent_999");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});