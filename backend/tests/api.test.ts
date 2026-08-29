import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index.js";

describe("API Endpoints", () => {
  it("GET /api/v1/health should return system status", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("HEALTHY");
    expect(res.body.service).toContain("Revora");
  });

  it("GET /api/v1/analytics/overview should return KPI metrics", async () => {
    const res = await request(app).get("/api/v1/analytics/overview");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("revenueProcessedInr");
    expect(res.body.data).toHaveProperty("revenueLostInr");
    expect(res.body.data).toHaveProperty("revenueAtRiskInr");
    expect(res.body.data.currency).toBe("INR");
  });

  it("GET /api/v1/transactions should return paginated list", async () => {
    const res = await request(app).get("/api/v1/transactions?limit=10&page=1");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(10);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.total).toBeGreaterThan(0);
  });

  it("GET /api/v1/transactions with filters should filter correctly", async () => {
    const res = await request(app).get("/api/v1/transactions?status=FAILED&limit=5");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    for (const tx of res.body.data) {
      expect(tx.status).toBe("FAILED");
    }
  });

  it("GET /api/v1/transactions/:id should return 404 for invalid ID", async () => {
    const res = await request(app).get("/api/v1/transactions/non_existent_tx_9999");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
