import { Transaction, FailureCategory } from "../types/transaction.js";
import {
  RecoveryOpportunity,
  OpportunitySummary,
  OpportunityPriority,
  RecommendedStrategy,
  ScoreFactors,
} from "../types/opportunity.js";
import { dbService } from "./databaseService.js";
import { revenueDetectiveService } from "./revenueDetectiveService.js";

// Baseline Category Recoverability Scores (0-100)
const CATEGORY_BASE_SCORES: Record<FailureCategory, number> = {
  CUSTOMER_AUTHENTICATION: 90,
  CHECKOUT_ABANDONMENT: 82,
  TECHNICAL_TIMEOUT: 75,
  MANDATE_SUBSCRIPTION_ERROR: 70,
  NETWORK_DROP: 65,
  CARD_LIMIT_EXCEEDED: 58,
  ISSUER_OUTAGE: 40,
  INSUFFICIENT_FUNDS: 25,
};

function calculateHistoryScore(customerOrders: number, customerLtv: number): number {
  if (customerOrders >= 10 || customerLtv >= 25000) return 95;
  if (customerOrders >= 5 || customerLtv >= 10000) return 85;
  if (customerOrders >= 2 || customerLtv >= 3000) return 70;
  return 55;
}

function calculateAmountScore(amountInr: number): number {
  if (amountInr >= 50000) return 95;
  if (amountInr >= 10000) return 88;
  if (amountInr >= 2000) return 78;
  return 65;
}

function calculateRecencyScore(failedAtIso: string): number {
  const ageMs = Date.now() - new Date(failedAtIso).getTime();
  const ageMinutes = ageMs / (1000 * 60);

  if (ageMinutes <= 15) return 95;
  if (ageMinutes <= 60) return 82;
  if (ageMinutes <= 360) return 65;
  if (ageMinutes <= 1440) return 50;
  return 35;
}

function assignStrategy(
  tx: Transaction,
  priority: OpportunityPriority,
  isSmartSilence: boolean
): { strategy: RecommendedStrategy; rationale: string } {
  if (isSmartSilence) {
    return {
      strategy: "SMART_SILENCE",
      rationale: `Smart Silence Active: ${tx.issuerBank} is experiencing server-side degradation. Suppressing outreach to prevent customer friction.`,
    };
  }

  if (tx.amountInr >= 50000) {
    return {
      strategy: "CONCIERGE_OUTREACH",
      rationale: `High-value transaction (₹${tx.amountInr.toLocaleString("en-IN")}): Assign to dedicated merchant support concierge for phone/VIP follow-up.`,
    };
  }

  switch (tx.failureCategory) {
    case "CUSTOMER_AUTHENTICATION":
      return {
        strategy: "IMMEDIATE_PAYMENT_LINK",
        rationale: "Customer dropped at 2FA/OTP stage. Send instant 15-minute Razorpay payment link via SMS/WhatsApp.",
      };
    case "CHECKOUT_ABANDONMENT":
      return {
        strategy: "WHATSAPP_NUDGE",
        rationale: "Customer abandoned checkout screen. Send conversational WhatsApp nudge with saved cart details.",
      };
    case "MANDATE_SUBSCRIPTION_ERROR":
      return {
        strategy: "SMART_RETRY",
        rationale: "Recurring subscription mandate failed. Schedule automated background server-side retry during off-peak hours.",
      };
    case "INSUFFICIENT_FUNDS":
    case "CARD_LIMIT_EXCEEDED":
      return {
        strategy: "EMAIL_RECOVERY",
        rationale: "Card decline due to limit or balance. Send branded email inviting customer to switch to UPI or Netbanking.",
      };
    case "TECHNICAL_TIMEOUT":
    case "NETWORK_DROP":
      return {
        strategy: "IMMEDIATE_PAYMENT_LINK",
        rationale: "Network drop interrupted transaction. Send fresh payment link to allow instant one-click completion.",
      };
    default:
      return {
        strategy: "WHATSAPP_NUDGE",
        rationale: "Standard recovery nudge via WhatsApp channel.",
      };
  }
}

export class RecoveryScoringService {
  public getOpportunities(params?: {
    priority?: OpportunityPriority;
    minScore?: number;
    search?: string;
  }): OpportunitySummary {
    const rawTxs = dbService.getAllRawTransactions();
    const customers = dbService.getCustomers();
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    // Check active incidents for Smart Silence triggers
    const detectionResult = revenueDetectiveService.runDetection();
    const degradedIssuers = new Set(
      detectionResult.incidents
        .filter((i) => i.smartSilenceRecommended && i.affectedIssuer)
        .map((i) => i.affectedIssuer!)
    );

    // Filter failed or abandoned transactions
    const failedTxs = rawTxs.filter(
      (t) => t.status === "FAILED" || t.status === "ABANDONED"
    );

    const opportunities: RecoveryOpportunity[] = [];

    for (const tx of failedTxs) {
      const cust = customerMap.get(tx.customerId) || {
        id: tx.customerId,
        name: tx.customerName,
        email: tx.customerEmail,
        phone: tx.customerPhone,
        totalOrders: 3,
        totalSpentInr: 12000,
        createdAt: tx.createdAt,
      };

      const categoryScore = CATEGORY_BASE_SCORES[tx.failureCategory] ?? 60;
      const historyScore = calculateHistoryScore(cust.totalOrders, cust.totalSpentInr);
      const amountScore = calculateAmountScore(tx.amountInr);
      const recencyScore = calculateRecencyScore(tx.createdAt);

      // Weighted calculation: 35% category + 30% history + 20% recency + 15% amount
      const rawScore =
        0.35 * categoryScore +
        0.30 * historyScore +
        0.20 * recencyScore +
        0.15 * amountScore;

      const recoveryScorePct = Math.min(99, Math.max(15, Math.round(rawScore)));

      let priority: OpportunityPriority = "LOW";
      if (recoveryScorePct >= 75) priority = "HIGH";
      else if (recoveryScorePct >= 50) priority = "MEDIUM";

      const isSmartSilence = degradedIssuers.has(tx.issuerBank);
      const { strategy, rationale } = assignStrategy(tx, priority, isSmartSilence);

      const scoreFactors: ScoreFactors = {
        categoryScore,
        historyScore,
        amountScore,
        recencyScore,
      };

      const estimatedRecoverableInr = Math.round(
        tx.amountInr * (recoveryScorePct / 100)
      );

      opportunities.push({
        id: `opp_${tx.id}`,
        transactionId: tx.id,
        customerId: cust.id,
        customerName: cust.name,
        customerEmail: cust.email,
        customerPhone: cust.phone,
        customerLtvInr: cust.totalSpentInr,
        amountInr: tx.amountInr,
        paymentMethod: tx.paymentMethod,
        issuerBank: tx.issuerBank,
        failureCategory: tx.failureCategory,
        failureReason: tx.failureReason,
        failedAt: tx.createdAt,
        recoveryScorePct,
        estimatedRecoverableInr,
        priority,
        recommendedStrategy: strategy,
        strategyRationale: rationale,
        scoreFactors,
        isSmartSilenceSuppressed: isSmartSilence,
        status: "OPEN",
      });
    }

    // Sort by recoveryScorePct desc, then amountInr desc
    opportunities.sort((a, b) => {
      if (b.recoveryScorePct !== a.recoveryScorePct) {
        return b.recoveryScorePct - a.recoveryScorePct;
      }
      return b.amountInr - a.amountInr;
    });

    // Apply optional params
    let filtered = opportunities;
    if (params?.priority) {
      filtered = filtered.filter((o) => o.priority === params.priority);
    }
    if (params?.minScore) {
      filtered = filtered.filter((o) => o.recoveryScorePct >= params.minScore!);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.transactionId.toLowerCase().includes(q) ||
          o.issuerBank.toLowerCase().includes(q)
      );
    }

    const totalRevenueAtRiskInr = opportunities.reduce((s, o) => s + o.amountInr, 0);
    const totalEstimatedRecoverableInr = opportunities.reduce(
      (s, o) => s + o.estimatedRecoverableInr,
      0
    );
    const avgScore =
      opportunities.length > 0
        ? Math.round(
            opportunities.reduce((s, o) => s + o.recoveryScorePct, 0) /
              opportunities.length
          )
        : 0;

    return {
      opportunities: filtered,
      totalOpportunitiesCount: opportunities.length,
      totalRevenueAtRiskInr,
      totalEstimatedRecoverableInr,
      highPriorityCount: opportunities.filter((o) => o.priority === "HIGH").length,
      mediumPriorityCount: opportunities.filter((o) => o.priority === "MEDIUM").length,
      lowPriorityCount: opportunities.filter((o) => o.priority === "LOW").length,
      averageRecoveryScorePct: avgScore,
      isSynthetic: true,
    };
  }

  public getOpportunityById(id: string): RecoveryOpportunity | null {
    const result = this.getOpportunities();
    return result.opportunities.find((o) => o.id === id || o.transactionId === id) || null;
  }
}

export const recoveryScoringService = new RecoveryScoringService();