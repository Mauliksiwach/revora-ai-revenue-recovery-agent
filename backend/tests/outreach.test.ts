import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/index.js";
import { outreachService } from "../src/services/outreachService.js";

describe("Phase 7: Multi-Lingual Outreach Engine", () => {
  it("should return localized templates for English, Hindi, and Hinglish", () => {
    const templates = outreachService.getTemplates();
    expect(templates.length).toBeGreaterThan(0);

    const languages = new Set(templates.map((t) => t.language));
    expect(languages.has("ENGLISH")).toBe(true);
    expect(languages.has("HINDI")).toBe(true);
    expect(languages.has("HINGLISH")).toBe(true);
  });

  it("should render a Hinglish preview with personalized placeholders", () => {
    const preview = outreachService.renderPreview({
      language: "HINGLISH",
      channel: "WHATSAPP",
      reasonCategory: "UPI_PIN_ERROR",
      customerName: "Aarav Patel",
      amountInr: 3499,
      orderId: "ORD-9988",
    });

    expect(preview.language).toBe("HINGLISH");
    expect(preview.channel).toBe("WHATSAPP");
    expect(preview.renderedText).toContain("Aarav Patel");
    expect(preview.renderedText).toContain("₹3,499");
    expect(preview.renderedText).toContain("ORD-9988");
    expect(preview.complianceChecked).toBe(true);
  });

  it("should render a Hindi preview with Devanagari script", () => {
    const preview = outreachService.renderPreview({
      language: "HINDI",
      channel: "WHATSAPP",
      reasonCategory: "UPI_PIN_ERROR",
      customerName: "रोहन वर्मा",
      amountInr: 1500,
      orderId: "ORD-7711",
    });

    expect(preview.language).toBe("HINDI");
    expect(preview.renderedText).toContain("नमस्ते");
    expect(preview.renderedText).toContain("रोहन वर्मा");
  });
});

describe("Phase 7: Outreach API Endpoints", () => {
  it("GET /api/v1/outreach/templates should return list of localized templates", async () => {
    const res = await request(app).get("/api/v1/outreach/templates");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("templates");
    expect(Array.isArray(res.body.templates)).toBe(true);
  });

  it("POST /api/v1/outreach/preview should generate custom preview response", async () => {
    const res = await request(app)
      .post("/api/v1/outreach/preview")
      .send({
        language: "HINGLISH",
        channel: "WHATSAPP",
        reasonCategory: "UPI_PIN_ERROR",
        customerName: "Vikram Malhotra",
        amountInr: 12500,
        orderId: "ORD-2026",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("renderedText");
    expect(res.body.renderedText).toContain("Vikram Malhotra");
    expect(res.body).toHaveProperty("paymentLink");
  });
});
