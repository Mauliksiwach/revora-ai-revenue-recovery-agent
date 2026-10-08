import { IssuerBank } from "./transaction.js";

export interface BankSwitchHealth {
  bank: IssuerBank;
  failureRatePct: number;
  baselineFailureRatePct: number;
  sampleSize: number;
  status: "HEALTHY" | "DEGRADED" | "OUTAGE";
  isSuppressed: boolean;
  suppressionReason?: string;
  lastEvaluatedAt: string;
}

export interface SmartSilenceEvent {
  id: string;
  bank: IssuerBank;
  eventType: "SUPPRESSION_ACTIVATED" | "AUTO_RESUMED" | "MANUAL_OVERRIDE";
  reason: string;
  affectedTransactionsCount: number;
  shieldedRevenueInr: number;
  failureRateAtEventPct: number;
  timestamp: string;
}

export interface SmartSilenceStatusSummary {
  isGlobalSmartSilenceActive: boolean;
  activeDegradedSwitchesCount: number;
  totalShieldedTransactionsCount: number;
  totalShieldedRevenueInr: number;
  switchHealthList: BankSwitchHealth[];
  recentEvents: SmartSilenceEvent[];
  lastCheckedAt: string;
  isSynthetic: boolean;
}