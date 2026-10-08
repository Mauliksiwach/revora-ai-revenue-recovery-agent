import {
  AgentDecision,
  AgentCycleSummary,
  AgentPolicyStatus,
  DecisionExecutionState,
  PolicyGateCheck,
} from "../types/agent.js";
import { recoveryScoringService } from "./recoveryScoringService.js";
import { RecoveryOpportunity } from "../types/opportunity.js";

class RevoraAgentStore {
  private decisions: AgentDecision[] = [];
  private customerContactHistory: Map<string, number[]> = new Map(); // customerId -> timestamps

  public getAllDecisions(): AgentDecision[] {
    return this.decisions;
  }

  public getDecisionById(id: string): AgentDecision | null {
    return this.decisions.find((d) => d.id === id) || null;
  }

  public saveDecisions(newDecisions: AgentDecision[]): void {
    // Upsert decisions by ID
    for (const d of newDecisions) {
      const idx = this.decisions.findIndex((existing) => existing.id === d.id);
      if (idx >= 0) {
        this.decisions[idx] = d;
      } else {
        this.decisions.push(d);
      }
    }
  }

  public recordContact(customerId: string, timestamp: number): void {
    const history = this.customerContactHistory.get(customerId) || [];
    history.push(timestamp);
    this.customerContactHistory.set(customerId, history);
  }

  public getLastContactTime(customerId: string): number | null {
    const history = this.customerContactHistory.get(customerId);
    if (!history || history.length === 0) return null;
    return Math.max(...history);
  }

  public getContactCount(customerId: string): number {
    const history = this.customerContactHistory.get(customerId);
    return history ? history.length : 0;
  }
}

export class RevoraAgentService {
  private store = new RevoraAgentStore();

  public runAgentCycle(): AgentCycleSummary {
    const { opportunities } = recoveryScoringService.getOpportunities();
    const cycleTimestamp = new Date().toISOString();
    const newDecisions: AgentDecision[] = [];

    const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours cooldown
    const MAX_CONTACT_CAP = 3;

    for (const opp of opportunities) {
      const decisionId = `dec_${opp.id}`;
      // Skip if already processed in this store
      const existing = this.store.getDecisionById(decisionId);
      if (existing && existing.executionState !== "PENDING_APPROVAL") {
        newDecisions.push(existing);
        continue;
      }

      const policyNotes: string[] = [];
      const lastContact = this.store.getLastContactTime(opp.customerId);
      const contactCount = this.store.getContactCount(opp.customerId);

      const cooldownPassed = !lastContact || Date.now() - lastContact >= COOLDOWN_MS;
      if (!cooldownPassed) {
        policyNotes.push(`Cooldown violation: Customer contacted within past 24 hours.`);
      }

      const maxCapPassed = contactCount < MAX_CONTACT_CAP;
      if (!maxCapPassed) {
        policyNotes.push(`Contact cap reached: Customer reached maximum limit of ${MAX_CONTACT_CAP} contacts.`);
      }

      const highTicketCheckPassed = opp.amountInr < 50000;
      if (!highTicketCheckPassed) {
        policyNotes.push(`High-ticket policy gate: Transaction amount ₹${opp.amountInr.toLocaleString("en-IN")} >= ₹50,000 requires human authorization.`);
      }

      const smartSilenceCheckPassed = !opp.isSmartSilenceSuppressed;
      if (!smartSilenceCheckPassed) {
        policyNotes.push(`Smart Silence policy gate: ${opp.issuerBank} CBS outage detected. All outreach suppressed.`);
      }

      const policyCheck: PolicyGateCheck = {
        cooldownPassed,
        maxCapPassed,
        highTicketCheckPassed,
        smartSilenceCheckPassed,
        policyNotes,
      };

      let policyStatus: AgentPolicyStatus = "APPROVED";
      let executionState: DecisionExecutionState = "EXECUTED";

      if (!smartSilenceCheckPassed) {
        policyStatus = "SUPPRESSED_SMART_SILENCE";
        executionState = "SKIPPED";
      } else if (!highTicketCheckPassed) {
        policyStatus = "REQUIRES_HUMAN_APPROVAL";
        executionState = "PENDING_APPROVAL";
      } else if (!cooldownPassed) {
        policyStatus = "BLOCKED_COOLDOWN";
        executionState = "SKIPPED";
      } else if (!maxCapPassed) {
        policyStatus = "BLOCKED_MAX_CONTACT_CAP";
        executionState = "SKIPPED";
      }

      let reasoningNarrative = "";
      if (policyStatus === "APPROVED") {
        reasoningNarrative = `Revora Agent selected action '${opp.recommendedStrategy}' for customer ${opp.customerName} (P_recovery: ${opp.recoveryScorePct}%). All 4 policy safety gates passed. Bounded action dispatched safely.`;
        this.store.recordContact(opp.customerId, Date.now());
      } else if (policyStatus === "REQUIRES_HUMAN_APPROVAL") {
        reasoningNarrative = `Revora Agent identified a high-value recovery opportunity (₹${opp.amountInr.toLocaleString("en-IN")}) requiring manual approval. Action '${opp.recommendedStrategy}' routed to Human Approval Queue.`;
      } else if (policyStatus === "SUPPRESSED_SMART_SILENCE") {
        reasoningNarrative = `Revora Agent suppressed action for ${opp.customerName} due to active ${opp.issuerBank} issuer switch outage. Protecting merchant brand reputation.`;
      } else if (policyStatus === "BLOCKED_COOLDOWN") {
        reasoningNarrative = `Revora Agent suppressed outreach to ${opp.customerName} because a contact occurred within the 24-hour cooldown window.`;
      } else {
        reasoningNarrative = `Revora Agent suppressed outreach to ${opp.customerName} as maximum contact cap (${MAX_CONTACT_CAP}) has been reached.`;
      }

      const decision: AgentDecision = {
        id: decisionId,
        opportunityId: opp.id,
        transactionId: opp.transactionId,
        customerId: opp.customerId,
        customerName: opp.customerName,
        customerEmail: opp.customerEmail,
        customerPhone: opp.customerPhone,
        amountInr: opp.amountInr,
        recoveryScorePct: opp.recoveryScorePct,
        selectedAction: opp.recommendedStrategy,
        policyStatus,
        executionState,
        reasoningNarrative,
        policyCheck,
        decidedAt: cycleTimestamp,
        executedAt: executionState === "EXECUTED" ? cycleTimestamp : undefined,
        actionPayload: {
          channel: opp.recommendedStrategy.includes("WHATSAPP")
            ? "WHATSAPP"
            : opp.recommendedStrategy.includes("EMAIL")
            ? "EMAIL"
            : "SMS",
          recipient: opp.customerPhone || opp.customerEmail,
          paymentUrl: `https://pay.razorpay.com/demo_${opp.transactionId}`,
        },
      };

      newDecisions.push(decision);
    }

    this.store.saveDecisions(newDecisions);
    const allDecisions = this.store.getAllDecisions();

    // Sort: PENDING_APPROVAL first, then EXECUTED, then SKIPPED/REJECTED
    allDecisions.sort((a, b) => {
      if (a.executionState === "PENDING_APPROVAL" && b.executionState !== "PENDING_APPROVAL") return -1;
      if (b.executionState === "PENDING_APPROVAL" && a.executionState !== "PENDING_APPROVAL") return 1;
      return new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime();
    });

    const approvedCount = allDecisions.filter((d) => d.policyStatus === "APPROVED").length;
    const blockedCooldownCount = allDecisions.filter((d) => d.policyStatus === "BLOCKED_COOLDOWN").length;
    const requiresHumanApprovalCount = allDecisions.filter((d) => d.executionState === "PENDING_APPROVAL").length;
    const suppressedSmartSilenceCount = allDecisions.filter((d) => d.policyStatus === "SUPPRESSED_SMART_SILENCE").length;

    const executedRevenueInr = allDecisions
      .filter((d) => d.executionState === "EXECUTED")
      .reduce((s, d) => s + d.amountInr, 0);

    const pendingApprovalRevenueInr = allDecisions
      .filter((d) => d.executionState === "PENDING_APPROVAL")
      .reduce((s, d) => s + d.amountInr, 0);

    return {
      decisions: allDecisions,
      totalDecisionsCount: allDecisions.length,
      approvedCount,
      blockedCooldownCount,
      requiresHumanApprovalCount,
      suppressedSmartSilenceCount,
      executedRevenueInr,
      pendingApprovalRevenueInr,
      cycleTimestamp,
      isSynthetic: true,
    };
  }

  public approveDecision(id: string): AgentDecision | null {
    const decision = this.store.getDecisionById(id);
    if (!decision) return null;

    decision.executionState = "EXECUTED";
    decision.executedAt = new Date().toISOString();
    decision.reasoningNarrative += ` [Human Authorization Granted at ${new Date().toLocaleTimeString()}]`;
    this.store.saveDecisions([decision]);
    return decision;
  }

  public rejectDecision(id: string): AgentDecision | null {
    const decision = this.store.getDecisionById(id);
    if (!decision) return null;

    decision.executionState = "REJECTED";
    decision.reasoningNarrative += ` [Human Authorization Rejected at ${new Date().toLocaleTimeString()}]`;
    this.store.saveDecisions([decision]);
    return decision;
  }

  public getDecisions(filter?: {
    policyStatus?: AgentPolicyStatus;
    executionState?: DecisionExecutionState;
    search?: string;
  }): AgentCycleSummary {
    const summary = this.runAgentCycle();
    let filtered = summary.decisions;

    if (filter?.policyStatus) {
      filtered = filtered.filter((d) => d.policyStatus === filter.policyStatus);
    }
    if (filter?.executionState) {
      filtered = filtered.filter((d) => d.executionState === filter.executionState);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.customerName.toLowerCase().includes(q) ||
          d.transactionId.toLowerCase().includes(q) ||
          d.selectedAction.toLowerCase().includes(q)
      );
    }

    return {
      ...summary,
      decisions: filtered,
    };
  }
}

export const revoraAgentService = new RevoraAgentService();