import {
  StrategyType,
  StrategySimulationResult,
  SimulationParams,
  RecoveryLabRunResult,
} from "../types/recoverylab.js";
import { dbService } from "./databaseService.js";
import { recoveryScoringService } from "./recoveryScoringService.js";

export class RecoveryLabService {
  public runSimulation(params?: SimulationParams): RecoveryLabRunResult {
    const rawTxs = dbService.getAllRawTransactions();
    const failedTxs = rawTxs.filter(
      (t) => t.status === "FAILED" || t.status === "ABANDONED"
    );

    const totalFailedCount = failedTxs.length;
    const totalRevenueAtRiskInr = Math.round(
      failedTxs.reduce((sum, t) => sum + t.amountInr, 0)
    );

    const outageSeverity = params?.outageSeverity || "MILD";
    const outagePenalty = outageSeverity === "SEVERE" ? 0.82 : outageSeverity === "MILD" ? 0.92 : 1.0;

    // 1. DO_NOTHING
    const doNothing: StrategySimulationResult = {
      strategyType: "DO_NOTHING",
      name: "Baseline — Do Nothing",
      description: "No automated outreach, payment links, or retries. All failed transactions are abandoned.",
      recoveredRevenueInr: 0,
      recoveryRatePct: 0,
      contactsInitiatedCount: 0,
      unnecessaryContactsPreventedCount: 0,
      outreachCostInr: 0,
      netRevenueRoiMultiplier: 0,
      customerFrictionScore: "NONE",
      isRecommended: false,
    };

    // 2. IMMEDIATE_NAIVE_RETRY
    const naiveRecovered = Math.round(totalRevenueAtRiskInr * 0.18 * outagePenalty);
    const naiveContacts = Math.round(totalFailedCount * 2.4);
    const naiveCost = Math.round(naiveContacts * 2.0);
    const naiveRoi = naiveCost > 0 ? Math.round((naiveRecovered / naiveCost) * 10) / 10 : 0;

    const naiveRetry: StrategySimulationResult = {
      strategyType: "IMMEDIATE_NAIVE_RETRY",
      name: "Immediate Naive Retry",
      description: "Blindly retries all failed transactions immediately without checking failure root cause or issuer health.",
      recoveredRevenueInr: naiveRecovered,
      recoveryRatePct: Math.round((naiveRecovered / totalRevenueAtRiskInr) * 1000) / 10,
      contactsInitiatedCount: naiveContacts,
      unnecessaryContactsPreventedCount: 0,
      outreachCostInr: naiveCost,
      netRevenueRoiMultiplier: naiveRoi,
      customerFrictionScore: "SEVERE",
      isRecommended: false,
    };

    // 3. EMAIL_ONLY
    const emailRecovered = Math.round(totalRevenueAtRiskInr * 0.28 * outagePenalty);
    const emailContacts = totalFailedCount;
    const emailCost = Math.round(emailContacts * 0.5);
    const emailRoi = emailCost > 0 ? Math.round((emailRecovered / emailCost) * 10) / 10 : 0;

    const emailOnly: StrategySimulationResult = {
      strategyType: "EMAIL_ONLY",
      name: "Email Recovery Only",
      description: "Dispatches standard email recovery notifications to all failed payment customers.",
      recoveredRevenueInr: emailRecovered,
      recoveryRatePct: Math.round((emailRecovered / totalRevenueAtRiskInr) * 1000) / 10,
      contactsInitiatedCount: emailContacts,
      unnecessaryContactsPreventedCount: 0,
      outreachCostInr: emailCost,
      netRevenueRoiMultiplier: emailRoi,
      customerFrictionScore: "LOW",
      isRecommended: false,
    };

    // 4. WHATSAPP_DIRECT
    const waRecovered = Math.round(totalRevenueAtRiskInr * 0.48 * outagePenalty);
    const waContacts = totalFailedCount;
    const waCost = Math.round(waContacts * 1.5);
    const waRoi = waCost > 0 ? Math.round((waRecovered / waCost) * 10) / 10 : 0;

    const whatsappDirect: StrategySimulationResult = {
      strategyType: "WHATSAPP_DIRECT",
      name: "WhatsApp Direct Nudge",
      description: "Sends direct conversational WhatsApp nudges to all failed payment phone numbers.",
      recoveredRevenueInr: waRecovered,
      recoveryRatePct: Math.round((waRecovered / totalRevenueAtRiskInr) * 1000) / 10,
      contactsInitiatedCount: waContacts,
      unnecessaryContactsPreventedCount: 0,
      outreachCostInr: waCost,
      netRevenueRoiMultiplier: waRoi,
      customerFrictionScore: "MODERATE",
      isRecommended: false,
    };

    // 5. PAYMENT_LINK_ONLY
    const linkRecovered = Math.round(totalRevenueAtRiskInr * 0.62 * outagePenalty);
    const linkContacts = totalFailedCount;
    const linkCost = Math.round(linkContacts * 2.0);
    const linkRoi = linkCost > 0 ? Math.round((linkRecovered / linkCost) * 10) / 10 : 0;

    const paymentLinkOnly: StrategySimulationResult = {
      strategyType: "PAYMENT_LINK_ONLY",
      name: "Razorpay Payment Link",
      description: "Dispatches instant 1-click Razorpay payment links via SMS/WhatsApp to all failed buyers.",
      recoveredRevenueInr: linkRecovered,
      recoveryRatePct: Math.round((linkRecovered / totalRevenueAtRiskInr) * 1000) / 10,
      contactsInitiatedCount: linkContacts,
      unnecessaryContactsPreventedCount: 0,
      outreachCostInr: linkCost,
      netRevenueRoiMultiplier: linkRoi,
      customerFrictionScore: "MODERATE",
      isRecommended: false,
    };

    // 6. REVORA_AI_ADAPTIVE
    // Computes true dynamic score sum from Phase 3 service
    const oppSummary = recoveryScoringService.getOpportunities();
    const revoraRecovered = Math.round(oppSummary.totalEstimatedRecoverableInr);
    const revoraRatePct = Math.round((revoraRecovered / totalRevenueAtRiskInr) * 1000) / 10;
    const revoraPrevented = Math.round(totalFailedCount * 0.38); // 38% prevented by Smart Silence & Cooldown
    const revoraContacts = totalFailedCount - revoraPrevented;
    const revoraCost = Math.round(revoraContacts * 1.8);
    const revoraRoi = revoraCost > 0 ? Math.round((revoraRecovered / revoraCost) * 10) / 10 : 0;

    const revoraAdaptive: StrategySimulationResult = {
      strategyType: "REVORA_AI_ADAPTIVE",
      name: "Revora AI Adaptive Agent",
      description: "Dynamic strategy assignment (P_recovery scoring) combined with Smart Silence outage suppression & 24h cooldown policy gates.",
      recoveredRevenueInr: revoraRecovered,
      recoveryRatePct: revoraRatePct,
      contactsInitiatedCount: revoraContacts,
      unnecessaryContactsPreventedCount: revoraPrevented,
      outreachCostInr: revoraCost,
      netRevenueRoiMultiplier: revoraRoi,
      customerFrictionScore: "LOW",
      isRecommended: true,
    };

    const strategyResults = [
      revoraAdaptive,
      paymentLinkOnly,
      whatsappDirect,
      emailOnly,
      naiveRetry,
      doNothing,
    ];

    const nextBest = paymentLinkOnly.recoveredRevenueInr;
    const revoraAdvantage = Math.max(0, revoraRecovered - nextBest);

    return {
      scenarioName: `Indian Fintech Simulation (${outageSeverity} Outage Scenario)`,
      totalRevenueAtRiskInr,
      totalFailedTransactionsCount: totalFailedCount,
      strategyResults,
      recommendedStrategy: "REVORA_AI_ADAPTIVE",
      revoraRevenueAdvantageInr: revoraAdvantage,
      simulationTimestamp: new Date().toISOString(),
      isSynthetic: true,
    };
  }
}

export const recoveryLabService = new RecoveryLabService();