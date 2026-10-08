import { IssuerBank } from "../types/transaction.js";
import {
  BankSwitchHealth,
  SmartSilenceEvent,
  SmartSilenceStatusSummary,
} from "../types/smartsilence.js";
import { dbService } from "./databaseService.js";

const BASELINE_FAILURE_RATE = 12.0;
const DEGRADATION_THRESHOLD = 35.0;
const OUTAGE_THRESHOLD = 55.0;
const WINDOW_MINUTES = 30;

class SmartSilenceStore {
  public manualOverrides: Map<IssuerBank, boolean> = new Map();
  public events: SmartSilenceEvent[] = [];
}

export class SmartSilenceService {
  private store = new SmartSilenceStore();

  public getStatusSummary(): SmartSilenceStatusSummary {
    const rawTxs = dbService.getAllRawTransactions();
    const cutoff = Date.now() - WINDOW_MINUTES * 60 * 1000;
    const windowTxs = rawTxs.filter((t) => new Date(t.createdAt).getTime() >= cutoff);

    const banks: IssuerBank[] = ["HDFC", "ICICI", "SBI", "AXIS", "KOTAK", "YES_BANK", "PNB", "BOB"];
    const switchHealthList: BankSwitchHealth[] = [];

    let totalShieldedCount = 0;
    let totalShieldedRevenue = 0;
    let activeDegradedCount = 0;

    for (const bank of banks) {
      const bankTxs = windowTxs.filter((t) => t.issuerBank === bank);
      const failed = bankTxs.filter((t) => t.status === "FAILED" || t.status === "ABANDONED");
      const failureRate = bankTxs.length >= 5 ? (failed.length / bankTxs.length) * 100 : 8.0;

      let status: "HEALTHY" | "DEGRADED" | "OUTAGE" = "HEALTHY";
      if (failureRate >= OUTAGE_THRESHOLD) status = "OUTAGE";
      else if (failureRate >= DEGRADATION_THRESHOLD) status = "DEGRADED";

      const manualOverride = this.store.manualOverrides.get(bank);
      const isSuppressed = manualOverride !== undefined ? manualOverride : (status !== "HEALTHY");

      if (isSuppressed) {
        activeDegradedCount++;
        totalShieldedCount += failed.length;
        totalShieldedRevenue += failed.reduce((s, t) => s + t.amountInr, 0);
      }

      switchHealthList.push({
        bank,
        failureRatePct: Math.round(failureRate * 10) / 10,
        baselineFailureRatePct: BASELINE_FAILURE_RATE,
        sampleSize: bankTxs.length,
        status,
        isSuppressed,
        suppressionReason: isSuppressed
          ? manualOverride !== undefined
            ? "Manual Merchant Override Active"
            : `${status} detected: ${failureRate.toFixed(1)}% failure rate exceeds ${DEGRADATION_THRESHOLD}% threshold.`
          : undefined,
        lastEvaluatedAt: new Date().toISOString(),
      });
    }

    // Generate automatic synthetic events if empty
    if (this.store.events.length === 0) {
      const hdfcHealth = switchHealthList.find((s) => s.bank === "HDFC");
      if (hdfcHealth && hdfcHealth.isSuppressed) {
        this.store.events.push({
          id: `sse_hdfc_${Date.now().toString(36)}`,
          bank: "HDFC",
          eventType: "SUPPRESSION_ACTIVATED",
          reason: `Automated Smart Silence activated due to HDFC CBS timeout spike (${hdfcHealth.failureRatePct}% failure rate).`,
          affectedTransactionsCount: hdfcHealth.sampleSize,
          shieldedRevenueInr: Math.round(totalShieldedRevenue),
          failureRateAtEventPct: hdfcHealth.failureRatePct,
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        });
      }
    }

    const isGlobalSmartSilenceActive = switchHealthList.some((s) => s.isSuppressed);

    return {
      isGlobalSmartSilenceActive,
      activeDegradedSwitchesCount: activeDegradedCount,
      totalShieldedTransactionsCount: totalShieldedCount,
      totalShieldedRevenueInr: Math.round(totalShieldedRevenue),
      switchHealthList,
      recentEvents: this.store.events,
      lastCheckedAt: new Date().toISOString(),
      isSynthetic: true,
    };
  }

  public toggleOverride(bank: IssuerBank, forceSuppressed?: boolean): BankSwitchHealth {
    const current = this.store.manualOverrides.get(bank);
    const nextState = forceSuppressed !== undefined ? forceSuppressed : !current;
    this.store.manualOverrides.set(bank, nextState);

    const summary = this.getStatusSummary();
    const updatedHealth = summary.switchHealthList.find((s) => s.bank === bank)!;

    this.store.events.unshift({
      id: `sse_override_${Date.now().toString(36)}`,
      bank,
      eventType: "MANUAL_OVERRIDE",
      reason: `Merchant manually ${nextState ? "ACTIVATED" : "PAUSED"} Smart Silence for ${bank}.`,
      affectedTransactionsCount: updatedHealth.sampleSize,
      shieldedRevenueInr: 0,
      failureRateAtEventPct: updatedHealth.failureRatePct,
      timestamp: new Date().toISOString(),
    });

    return updatedHealth;
  }

  public getEventHistory(): SmartSilenceEvent[] {
    const summary = this.getStatusSummary();
    return summary.recentEvents;
  }
}

export const smartSilenceService = new SmartSilenceService();