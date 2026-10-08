import { RecommendedStrategy } from "./opportunity.js";

export type AgentPolicyStatus =
  | "APPROVED"
  | "BLOCKED_COOLDOWN"
  | "BLOCKED_MAX_CONTACT_CAP"
  | "REQUIRES_HUMAN_APPROVAL"
  | "SUPPRESSED_SMART_SILENCE";

export type DecisionExecutionState =
  | "PENDING_APPROVAL"
  | "EXECUTED"
  | "REJECTED"
  | "SKIPPED";

export interface PolicyGateCheck {
  cooldownPassed: boolean;
  maxCapPassed: boolean;
  highTicketCheckPassed: boolean;
  smartSilenceCheckPassed: boolean;
  policyNotes: string[];
}

export interface AgentDecision {
  id: string;
  opportunityId: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amountInr: number;
  recoveryScorePct: number;
  selectedAction: RecommendedStrategy;
  policyStatus: AgentPolicyStatus;
  executionState: DecisionExecutionState;
  reasoningNarrative: string;
  policyCheck: PolicyGateCheck;
  decidedAt: string;
  executedAt?: string;
  actionPayload?: {
    channel?: string;
    recipient?: string;
    paymentUrl?: string;
    templateId?: string;
  };
}

export interface AgentCycleSummary {
  decisions: AgentDecision[];
  totalDecisionsCount: number;
  approvedCount: number;
  blockedCooldownCount: number;
  requiresHumanApprovalCount: number;
  suppressedSmartSilenceCount: number;
  executedRevenueInr: number;
  pendingApprovalRevenueInr: number;
  cycleTimestamp: string;
  isSynthetic: boolean;
}