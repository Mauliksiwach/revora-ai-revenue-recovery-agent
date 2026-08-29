import { describe, it, expect } from "vitest";
import { AnalyticsService } from "../src/services/analyticsService.js";
import { Transaction } from "../src/types/transaction.js";

describe("Analytics Service", () => {
  const analytics = new AnalyticsService();

  const mockTxs: Transaction[] = [
    {
      id: "tx_1",
      orderId: "order_1",
      customerId: "cust_1",
      customerName: "Aarav Sharma",
      customerEmail: "aarav@example.com",
      customerPhone: "+91 9800000001",
      amountInr: 2500,
      currency: "INR",
      status: "SUCCESS",
      paymentMethod: "UPI",
      issuerBank: "HDFC",
      retryCount: 0,
      isSubscription: false,
      isSynthetic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "tx_2",
      orderId: "order_2",
      customerId: "cust_2",
      customerName: "Priya Patel",
      customerEmail: "priya@example.com",
      customerPhone: "+91 9800000002",
      amountInr: 1500,
      currency: "INR",
      status: "FAILED",
      paymentMethod: "CREDIT_CARD",
      issuerBank: "ICICI",
      failureCategory: "CUSTOMER_AUTHENTICATION",
      failureCode: "INCORRECT_OTP",
      failureReason: "Incorrect OTP entered",
      retryCount: 1,
      isSubscription: false,
      isSynthetic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "tx_3",
      orderId: "order_3",
      customerId: "cust_3",
      customerName: "Maulik Siwach",
      customerEmail: "maulik@example.com",
      customerPhone: "+91 9800000003",
      amountInr: 1000,
      currency: "INR",
      status: "ABANDONED",
      paymentMethod: "UPI",
      issuerBank: "SBI",
      failureCategory: "CHECKOUT_ABANDONMENT",
      failureCode: "PAYMENT_ABANDONED_STEP_OTP",
      failureReason: "Customer dropped off during OTP",
      retryCount: 0,
      isSubscription: false,
      isSynthetic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it("should accurately compute overview KPIs", () => {
    const overview = analytics.getOverview(mockTxs);
    expect(overview.totalTransactions).toBe(3);
    expect(overview.successfulPayments).toBe(1);
    expect(overview.failedPayments).toBe(1);
    expect(overview.abandonedCheckouts).toBe(1);
    expect(overview.revenueProcessedInr).toBe(2500);
    expect(overview.revenueLostInr).toBe(2500); // 1500 + 1000
    expect(overview.revenueAtRiskInr).toBe(2500);
    expect(overview.successRatePct).toBe(33.3);
    expect(overview.failureRatePct).toBe(66.7);
  });
});
