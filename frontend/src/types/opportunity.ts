import type { FailureCategory, PaymentMethod, IssuerBank } from "./index";

export type OpportunityPriority = "HIGH" | "MEDIUM" | "LOW";

export type RecommendedStrategy =
  | "IMMEDIATE_PAYMENT_LINK"
  | "WHATSAPP_NUDGE"
  | "EMAIL_RECOVERY"
  | "SMART_RETRY"
  | "CONCIERGE_OUTREACH"
  | "SMART_SILENCE"
  | "DO_NOT_CONTACT";

export interface ScoreFactors {
  historyScore: number;
  categoryScore: number;
  amountScore: number;
  recencyScore: number;
}

export interface RecoveryOpportunity {
  id: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLtvInr: number;
  amountInr: number;
  paymentMethod: PaymentMethod;
  issuerBank: IssuerBank;
  failureCategory: FailureCategory;
  failureReason: string;
  failedAt: string;
  recoveryScorePct: number;
  estimatedRecoverableInr: number;
  priority: OpportunityPriority;
  recommendedStrategy: RecommendedStrategy;
  strategyRationale: string;
  scoreFactors: ScoreFactors;
  isSmartSilenceSuppressed: boolean;
  status: "OPEN" | "ACTIONED" | "DISMISSED" | "RECOVERED";
}

export interface OpportunitySummary {
  opportunities: RecoveryOpportunity[];
  totalOpportunitiesCount: number;
  totalRevenueAtRiskInr: number;
  totalEstimatedRecoverableInr: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  averageRecoveryScorePct: number;
  isSynthetic: boolean;
}