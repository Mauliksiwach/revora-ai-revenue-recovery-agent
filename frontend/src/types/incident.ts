export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IncidentStatus = "ACTIVE" | "INVESTIGATING" | "RESOLVED" | "MONITORING";
export type DiagnosisType =
  | "ISSUER_OUTAGE"
  | "UPI_SWITCH_THROTTLE"
  | "AUTHENTICATION_SPIKE"
  | "INSUFFICIENT_FUNDS_SURGE"
  | "CARD_DECLINE_CLUSTER"
  | "CHECKOUT_ABANDONMENT_SURGE"
  | "MANDATE_FAILURE_CLUSTER"
  | "MULTI_RAIL_FAILURE";

export interface IncidentEvidence {
  metricLabel: string;
  value: string;
  significance: "STRONG" | "MODERATE" | "WEAK";
}

export interface RevenueIncident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  diagnosisType: DiagnosisType;
  affectedIssuer?: string;
  affectedMethod?: string;
  affectedTransactionsCount: number;
  affectedRevenueInr: number;
  failureRatePct: number;
  baselineFailureRatePct: number;
  aiDiagnosis: string;
  aiConfidencePct: number;
  evidence: IncidentEvidence[];
  recommendation: string;
  smartSilenceRecommended: boolean;
  detectedAt: string;
  resolvedAt?: string;
  timeWindowMinutes: number;
  isSynthetic: boolean;
}

export interface DetectionResult {
  incidents: RevenueIncident[];
  totalRevenueAtRiskInr: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  smartSilenceActive: boolean;
  analysisTimestamp: string;
  isSynthetic: boolean;
}