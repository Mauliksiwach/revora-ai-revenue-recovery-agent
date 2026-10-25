export type TimelineEventType =
  | "TRANSACTION_FAILED"
  | "INCIDENT_DETECTED"
  | "OPPORTUNITY_SCORED"
  | "POLICY_VERIFIED"
  | "ACTION_RECOMMENDED"
  | "HUMAN_APPROVAL_REQUESTED"
  | "HUMAN_APPROVED"
  | "HUMAN_REJECTED"
  | "ACTION_EXECUTED"
  | "SMART_SILENCE_ACTIVATED"
  | "PAYMENT_RECOVERED"
  | "RECOVERY_EXPIRED";

export type EventActor = "REVORA_AI" | "MERCHANT_ADMIN" | "SYSTEM_GATEWAY" | "CUSTOMER";
export type EventSeverity = "INFO" | "SUCCESS" | "WARNING" | "BLOCKED" | "RECOVERED";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  eventType: TimelineEventType;
  actor: EventActor;
  severity: EventSeverity;
  transactionId: string;
  orderId?: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  amountInr: number;
  paymentMethod: string;
  issuer: string;
  summary: string;
  evidenceNarrative: string;
  auditHash: string;
  metadata?: Record<string, any>;
}

export interface AIPerformanceProof {
  totalEvaluatedDecisions: number;
  totalExecutedActions: number;
  totalRecoveredRevenueInr: number;
  totalShieldedRevenueInr: number;
  overallAccuracyRatePct: number;
  falsePositiveRatePct: number;
  spamReductionRatePct: number;
  netRoiMultiplier: number;
  recoveryBreakdown: {
    recoveredCount: number;
    pendingCount: number;
    expiredCount: number;
    blockedCount: number;
  };
  confidenceCalibration: Array<{
    bracket: string;
    predictedProbPct: number;
    actualRecoveryPct: number;
    sampleSize: number;
  }>;
}

export interface TimelineFilterParams {
  eventType?: string;
  actor?: string;
  search?: string;
  transactionId?: string;
  page?: number;
  limit?: number;
}
