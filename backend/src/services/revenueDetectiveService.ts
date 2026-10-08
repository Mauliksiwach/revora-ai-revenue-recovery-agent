import { v4 as uuidv4 } from "uuid";
import { Transaction, IssuerBank, PaymentMethod, FailureCategory } from "../types/transaction.js";
import {
  RevenueIncident,
  DetectionResult,
  IncidentSeverity,
  IncidentEvidence,
  DiagnosisType,
} from "../types/incident.js";
import { dbService } from "./databaseService.js";

// ------------------------------------------------------------------
// Thresholds and Configuration
// ------------------------------------------------------------------
const BASELINE_FAILURE_RATE = 12.0;          // expected normal failure rate %
const ISSUER_DEGRADATION_THRESHOLD = 35.0;   // issuer failure rate above this = likely outage
const SPIKE_RATE_MULTIPLIER = 2.5;           // failure rate is 2.5x baseline in window
const WINDOW_MINUTES = 30;                   // rolling detection window in minutes
const MIN_TRANSACTIONS_FOR_SIGNAL = 8;       // ignore tiny sample sizes

// ------------------------------------------------------------------
// Utility: bucket transactions into the last N minutes
// ------------------------------------------------------------------
function transactionsInWindow(txs: Transaction[], windowMinutes: number): Transaction[] {
  const cutoff = Date.now() - windowMinutes * 60 * 1000;
  return txs.filter((t) => new Date(t.createdAt).getTime() >= cutoff);
}

function severityFromRate(failureRatePct: number, baselinePct: number): IncidentSeverity {
  const multiplier = failureRatePct / baselinePct;
  if (failureRatePct >= 70 || multiplier >= 6) return "CRITICAL";
  if (failureRatePct >= 50 || multiplier >= 4) return "HIGH";
  if (failureRatePct >= 30 || multiplier >= 2.5) return "MEDIUM";
  return "LOW";
}

function confidenceFromEvidence(evidenceCount: number, ratioStrength: number): number {
  // Confidence grows with evidence count and how far the rate exceeds baseline
  const base = Math.min(95, 55 + evidenceCount * 8 + ratioStrength * 4);
  return Math.round(base);
}

// ------------------------------------------------------------------
// DETECTION RULE 1: Issuer Bank Degradation
// ------------------------------------------------------------------
function detectIssuerDegradation(
  allTxs: Transaction[],
  windowTxs: Transaction[]
): RevenueIncident[] {
  const incidents: RevenueIncident[] = [];
  const banks: IssuerBank[] = ["HDFC", "ICICI", "SBI", "AXIS", "KOTAK", "YES_BANK", "PNB", "BOB"];

  for (const bank of banks) {
    const bankTxs = windowTxs.filter((t) => t.issuerBank === bank);
    if (bankTxs.length < MIN_TRANSACTIONS_FOR_SIGNAL) continue;

    const failed = bankTxs.filter((t) => t.status === "FAILED" || t.status === "ABANDONED");
    const failureRate = (failed.length / bankTxs.length) * 100;

    if (failureRate < ISSUER_DEGRADATION_THRESHOLD) continue;

    // Check if failure is concentrated on UPI (classic CBS/NPCI issue)
    const upiFailures = failed.filter((t) => t.paymentMethod === "UPI");
    const upiConcentration = failed.length > 0 ? (upiFailures.length / failed.length) * 100 : 0;
    const issuerOutageEvidence = failed.filter(
      (t) => t.failureCategory === "ISSUER_OUTAGE" || t.failureCategory === "TECHNICAL_TIMEOUT"
    );
    const issuerOutagePct = failed.length > 0 ? (issuerOutageEvidence.length / failed.length) * 100 : 0;

    const affectedRevenue = failed.reduce((sum, t) => sum + t.amountInr, 0);
    const multiplier = failureRate / BASELINE_FAILURE_RATE;
    const severity = severityFromRate(failureRate, BASELINE_FAILURE_RATE);

    const evidence: IncidentEvidence[] = [
      {
        metricLabel: "Failure rate in window",
        value: `${failureRate.toFixed(1)}% (baseline: ${BASELINE_FAILURE_RATE}%)`,
        significance: "STRONG",
      },
      {
        metricLabel: "Failed transactions",
        value: `${failed.length} of ${bankTxs.length} in last ${WINDOW_MINUTES} min`,
        significance: "STRONG",
      },
    ];

    if (upiConcentration > 60) {
      evidence.push({
        metricLabel: "UPI concentration in failures",
        value: `${upiConcentration.toFixed(0)}% of failures on UPI rail`,
        significance: "STRONG",
      });
    }
    if (issuerOutagePct > 50) {
      evidence.push({
        metricLabel: "Issuer timeout / outage codes",
        value: `${issuerOutagePct.toFixed(0)}% of failures carry CBS timeout error codes`,
        significance: "STRONG",
      });
    }
    evidence.push({
      metricLabel: "Rate vs baseline multiplier",
      value: `${multiplier.toFixed(1)}x above normal failure rate`,
      significance: multiplier >= 4 ? "STRONG" : "MODERATE",
    });

    const confidence = confidenceFromEvidence(evidence.length, multiplier);

    const isCritical = severity === "CRITICAL" || severity === "HIGH";
    const diagnosisType: DiagnosisType = upiConcentration > 60 ? "UPI_SWITCH_THROTTLE" : "ISSUER_OUTAGE";

    incidents.push({
      id: `inc_${bank.toLowerCase()}_${Date.now().toString(36)}`,
      title: `${bank} ${upiConcentration > 60 ? "UPI Switch Throttle" : "Issuer CBS Outage"} Detected`,
      severity,
      status: isCritical ? "ACTIVE" : "INVESTIGATING",
      diagnosisType,
      affectedIssuer: bank,
      affectedMethod: upiConcentration > 60 ? "UPI" : undefined,
      affectedTransactionsCount: failed.length,
      affectedRevenueInr: Math.round(affectedRevenue),
      failureRatePct: Math.round(failureRate * 10) / 10,
      baselineFailureRatePct: BASELINE_FAILURE_RATE,
      aiDiagnosis: upiConcentration > 60
        ? `${failed.length} payment failures detected within ${WINDOW_MINUTES} minutes, with ${upiConcentration.toFixed(0)}% concentrated on the ${bank} UPI switch. This pattern is consistent with NPCI PSP routing congestion or ${bank} core banking system (CBS) degradation affecting UPI transaction authorization. Individual customer errors are unlikely at this concentration and timing.`
        : `${failed.length} payment failures detected within ${WINDOW_MINUTES} minutes on ${bank} issuer routes. ${issuerOutagePct.toFixed(0)}% of failures carry CBS timeout or gateway 503 codes, suggesting ${bank} server-side infrastructure degradation rather than customer-side authentication errors.`,
      aiConfidencePct: confidence,
      evidence,
      recommendation: isCritical
        ? `SMART SILENCE: Do NOT contact customers immediately — this appears to be an infrastructure issue, not customer error. Monitor ${bank} switch health for 15–20 minutes. If failure rate subsides, retry via alternate rail. If it persists beyond 20 min, escalate to merchant support team.`
        : `WAIT and MONITOR ${bank} failure rate for the next 10 minutes. If failure rate drops below ${BASELINE_FAILURE_RATE}%, resume standard recovery pipeline. Consider offering alternate payment method (e.g. switch from UPI to Netbanking) for new payment attempts.`,
      smartSilenceRecommended: isCritical,
      detectedAt: new Date().toISOString(),
      timeWindowMinutes: WINDOW_MINUTES,
      isSynthetic: true,
    });
  }

  return incidents;
}

// ------------------------------------------------------------------
// DETECTION RULE 2: Authentication Failure Spike
// ------------------------------------------------------------------
function detectAuthFailureSpike(windowTxs: Transaction[]): RevenueIncident[] {
  const incidents: RevenueIncident[] = [];

  const authFailures = windowTxs.filter(
    (t) => t.failureCategory === "CUSTOMER_AUTHENTICATION"
  );
  const totalInWindow = windowTxs.length;
  if (totalInWindow < MIN_TRANSACTIONS_FOR_SIGNAL || authFailures.length < 5) return incidents;

  const authFailurePct = (authFailures.length / totalInWindow) * 100;
  const expectedAuthFailurePct = 4.0; // normal baseline for auth errors
  if (authFailurePct < expectedAuthFailurePct * SPIKE_RATE_MULTIPLIER) return incidents;

  const affectedRevenue = authFailures.reduce((sum, t) => sum + t.amountInr, 0);
  const multiplier = authFailurePct / expectedAuthFailurePct;
  const severity = severityFromRate(authFailurePct, expectedAuthFailurePct);

  const evidence: IncidentEvidence[] = [
    {
      metricLabel: "Authentication failure rate in window",
      value: `${authFailurePct.toFixed(1)}% (normal baseline: ${expectedAuthFailurePct}%)`,
      significance: "STRONG",
    },
    {
      metricLabel: "Auth failures",
      value: `${authFailures.length} in last ${WINDOW_MINUTES} min`,
      significance: "STRONG",
    },
    {
      metricLabel: "Rate vs baseline multiplier",
      value: `${multiplier.toFixed(1)}x above normal authentication failure rate`,
      significance: multiplier >= 3 ? "STRONG" : "MODERATE",
    },
  ];

  const confidence = confidenceFromEvidence(evidence.length, multiplier);

  incidents.push({
    id: `inc_auth_${Date.now().toString(36)}`,
    title: "Authentication Failure Spike — Possible OTP / MPIN Issue",
    severity,
    status: "INVESTIGATING",
    diagnosisType: "AUTHENTICATION_SPIKE",
    affectedTransactionsCount: authFailures.length,
    affectedRevenueInr: Math.round(affectedRevenue),
    failureRatePct: Math.round(authFailurePct * 10) / 10,
    baselineFailureRatePct: expectedAuthFailurePct,
    aiDiagnosis: `${authFailures.length} authentication failures detected in the last ${WINDOW_MINUTES} minutes — ${multiplier.toFixed(1)}x above the expected baseline. High-intent customers are reaching the OTP or MPIN stage but failing to complete authentication. This could indicate OTP delivery delays from telecom providers, or a UPI app MPIN validation problem.`,
    aiConfidencePct: confidence,
    evidence,
    recommendation: `SEND PAYMENT LINK: These are high-intent customers (they reached authentication). Send a fresh, 15-minute secure payment link via WhatsApp or SMS. Do NOT retry immediately — allow the customer to attempt at their own pace to avoid OTP lockout.`,
    smartSilenceRecommended: false,
    detectedAt: new Date().toISOString(),
    timeWindowMinutes: WINDOW_MINUTES,
    isSynthetic: true,
  });

  return incidents;
}

// ------------------------------------------------------------------
// DETECTION RULE 3: Multi-Rail Failure Pattern
// ------------------------------------------------------------------
function detectMultiRailFailure(windowTxs: Transaction[]): RevenueIncident[] {
  const incidents: RevenueIncident[] = [];
  const methods: PaymentMethod[] = ["UPI", "CREDIT_CARD", "DEBIT_CARD"];
  let failingMethods = 0;
  let totalAffectedRevenue = 0;
  let totalFailures = 0;
  const failingMethodNames: string[] = [];

  for (const method of methods) {
    const methodTxs = windowTxs.filter((t) => t.paymentMethod === method);
    if (methodTxs.length < 5) continue;
    const failed = methodTxs.filter((t) => t.status === "FAILED");
    const rate = (failed.length / methodTxs.length) * 100;
    if (rate >= ISSUER_DEGRADATION_THRESHOLD) {
      failingMethods++;
      totalAffectedRevenue += failed.reduce((s, t) => s + t.amountInr, 0);
      totalFailures += failed.length;
      failingMethodNames.push(method);
    }
  }

  if (failingMethods < 2) return incidents;

  const evidence: IncidentEvidence[] = [
    {
      metricLabel: "Simultaneously failing payment rails",
      value: `${failingMethodNames.join(", ")}`,
      significance: "STRONG",
    },
    {
      metricLabel: "Total failures across rails",
      value: `${totalFailures} in last ${WINDOW_MINUTES} min`,
      significance: "STRONG",
    },
    {
      metricLabel: "Revenue at risk",
      value: `₹${(totalAffectedRevenue / 100000).toFixed(1)}L`,
      significance: "STRONG",
    },
  ];

  incidents.push({
    id: `inc_multiRail_${Date.now().toString(36)}`,
    title: "Multi-Rail Payment Failure — Possible Gateway / Network Issue",
    severity: "HIGH",
    status: "ACTIVE",
    diagnosisType: "MULTI_RAIL_FAILURE",
    affectedTransactionsCount: totalFailures,
    affectedRevenueInr: Math.round(totalAffectedRevenue),
    failureRatePct: 45.0,
    baselineFailureRatePct: BASELINE_FAILURE_RATE,
    aiDiagnosis: `Simultaneous elevated failure rates detected across ${failingMethods} payment rails (${failingMethodNames.join(", ")}). When multiple payment rails fail at the same time, this typically signals a payment gateway infrastructure issue or acquiring bank network problem, rather than customer-side or individual issuer-side failure.`,
    aiConfidencePct: 82,
    evidence,
    recommendation: `ESCALATE TO HUMAN: Multi-rail failure requires immediate merchant team awareness and gateway provider status check. Pause all automated recovery actions until root cause is identified.`,
    smartSilenceRecommended: true,
    detectedAt: new Date().toISOString(),
    timeWindowMinutes: WINDOW_MINUTES,
    isSynthetic: true,
  });

  return incidents;
}

// ------------------------------------------------------------------
// MAIN: Revora Intelligence Detection Engine
// ------------------------------------------------------------------
export class RevenueDetectiveService {
  public runDetection(): DetectionResult {
    const allTxs = dbService.getAllRawTransactions();
    const windowTxs = transactionsInWindow(allTxs, WINDOW_MINUTES);

    const incidents: RevenueIncident[] = [
      ...detectIssuerDegradation(allTxs, windowTxs),
      ...detectAuthFailureSpike(windowTxs),
      ...detectMultiRailFailure(windowTxs),
    ];

    // Sort: CRITICAL first, then HIGH, MEDIUM, LOW; then by affected revenue desc
    const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    incidents.sort((a, b) => {
      const sev = (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4);
      if (sev !== 0) return sev;
      return b.affectedRevenueInr - a.affectedRevenueInr;
    });

    const totalRevenueAtRiskInr = incidents.reduce((s, i) => s + i.affectedRevenueInr, 0);
    const smartSilenceActive = incidents.some((i) => i.smartSilenceRecommended && i.status === "ACTIVE");

    return {
      incidents,
      totalRevenueAtRiskInr,
      criticalCount: incidents.filter((i) => i.severity === "CRITICAL").length,
      highCount: incidents.filter((i) => i.severity === "HIGH").length,
      mediumCount: incidents.filter((i) => i.severity === "MEDIUM").length,
      lowCount: incidents.filter((i) => i.severity === "LOW").length,
      smartSilenceActive,
      analysisTimestamp: new Date().toISOString(),
      isSynthetic: true,
    };
  }

  public getIncidentById(id: string): RevenueIncident | null {
    const result = this.runDetection();
    return result.incidents.find((i) => i.id === id) || null;
  }
}

export const revenueDetectiveService = new RevenueDetectiveService();