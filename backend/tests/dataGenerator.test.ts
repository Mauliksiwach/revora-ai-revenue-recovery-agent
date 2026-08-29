import { describe, it, expect } from "vitest";
import { generateSyntheticTransactions, generateSyntheticCustomers } from "../src/services/dataGenerator.js";

describe("Synthetic Data Generator", () => {
  it("should generate the requested number of synthetic customers", () => {
    const customers = generateSyntheticCustomers(50);
    expect(customers.length).toBe(50);
    expect(customers[0]).toHaveProperty("id");
    expect(customers[0]).toHaveProperty("name");
    expect(customers[0]).toHaveProperty("email");
    expect(customers[0]).toHaveProperty("phone");
    expect(customers[0]).toHaveProperty("lifetimeValueInr");
  });

  it("should generate synthetic transactions with realistic Indian payment attributes", () => {
    const { transactions, customers } = generateSyntheticTransactions(100);
    expect(transactions.length).toBe(100);
    expect(customers.length).toBeGreaterThan(0);

    const validStatuses = ["SUCCESS", "FAILED", "PENDING", "ABANDONED", "REFUNDED"];
    const validMethods = ["UPI", "CREDIT_CARD", "DEBIT_CARD", "NETBANKING", "WALLET", "EMI"];
    const validBanks = ["HDFC", "ICICI", "SBI", "AXIS", "KOTAK", "YES_BANK", "PNB", "BOB"];

    for (const tx of transactions) {
      expect(validStatuses).toContain(tx.status);
      expect(validMethods).toContain(tx.paymentMethod);
      expect(validBanks).toContain(tx.issuerBank);
      expect(tx.amountInr).toBeGreaterThan(0);
      expect(tx.currency).toBe("INR");
      expect(tx.isSynthetic).toBe(true);

      if (tx.status === "FAILED") {
        expect(tx.failureCategory).toBeDefined();
        expect(tx.failureCode).toBeDefined();
        expect(tx.failureReason).toBeDefined();
      }
    }
  });

  it("should generate spike anomaly when enabled", () => {
    const { transactions } = generateSyntheticTransactions(500, undefined, true);
    const hdfcFailures = transactions.filter(
      (t) => t.issuerBank === "HDFC" && t.status === "FAILED" && t.failureCategory === "ISSUER_OUTAGE"
    );
    expect(hdfcFailures.length).toBeGreaterThan(0);
  });
});
