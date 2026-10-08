import type {
  MetricsOverview,
  TrendPoint,
  BreakdownsData,
  Transaction,
  TransactionFilterState,
} from "../types/index";
import type { DetectionResult } from "../types/incident";
import type { OpportunitySummary, OpportunityPriority } from "../types/opportunity";
import type { AgentCycleSummary, AgentPolicyStatus, DecisionExecutionState, AgentDecision } from "../types/agent";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export async function fetchHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function fetchOverview(): Promise<MetricsOverview> {
  const res = await fetch(`${API_BASE}/analytics/overview`);
  if (!res.ok) throw new Error("Failed to fetch overview metrics");
  const json = await res.json();
  return json.data;
}

export async function fetchTrends(bucketHours = 2): Promise<TrendPoint[]> {
  const res = await fetch(`${API_BASE}/analytics/trends?bucketHours=${bucketHours}`);
  if (!res.ok) throw new Error("Failed to fetch trends");
  const json = await res.json();
  return json.data;
}

export async function fetchBreakdowns(): Promise<BreakdownsData> {
  const res = await fetch(`${API_BASE}/analytics/breakdown`);
  if (!res.ok) throw new Error("Failed to fetch breakdown analytics");
  const json = await res.json();
  return json.data;
}

export async function fetchTransactions(
  filters: TransactionFilterState
): Promise<{
  data: Transaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const params = new URLSearchParams();
  params.append("page", String(filters.page));
  params.append("limit", String(filters.limit));
  if (filters.search) params.append("search", filters.search);
  if (filters.status && filters.status !== "ALL") params.append("status", filters.status);
  if (filters.method && filters.method !== "ALL") params.append("method", filters.method);
  if (filters.issuer && filters.issuer !== "ALL") params.append("issuer", filters.issuer);
  if (filters.failureCategory && filters.failureCategory !== "ALL") {
    params.append("failureCategory", filters.failureCategory);
  }
  params.append("sortBy", filters.sortBy);
  params.append("sortOrder", filters.sortOrder);

  const res = await fetch(`${API_BASE}/transactions?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function fetchTransactionById(id: string): Promise<Transaction> {
  const res = await fetch(`${API_BASE}/transactions/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch transaction ${id}`);
  const json = await res.json();
  return json.data;
}

export async function regenerateSimulationData(count = 1200): Promise<void> {
  const res = await fetch(`${API_BASE}/simulation/regenerate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count }),
  });
  if (!res.ok) throw new Error("Failed to regenerate simulation dataset");
}

// Phase 2: Revora Intelligence / AI Revenue Detective
export async function fetchDetectionResults(): Promise<DetectionResult> {
  const res = await fetch(`${API_BASE}/intelligence/detect`);
  if (!res.ok) throw new Error("Failed to run Revora Intelligence detection");
  const json = await res.json();
  return json.data;
}

// Phase 3: Recovery Opportunity Scoring Engine
export async function fetchRecoveryOpportunities(params?: {
  priority?: OpportunityPriority;
  minScore?: number;
  search?: string;
}): Promise<OpportunitySummary> {
  const query = new URLSearchParams();
  if (params?.priority) query.append("priority", params.priority);
  if (params?.minScore) query.append("minScore", String(params.minScore));
  if (params?.search) query.append("search", params.search);

  const res = await fetch(`${API_BASE}/opportunities?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch recovery opportunities");
  const json = await res.json();
  return json.data;
}

// Phase 4: Revora Agent Core Engine
export async function fetchAgentDecisions(params?: {
  policyStatus?: AgentPolicyStatus;
  executionState?: DecisionExecutionState;
  search?: string;
}): Promise<AgentCycleSummary> {
  const query = new URLSearchParams();
  if (params?.policyStatus) query.append("policyStatus", params.policyStatus);
  if (params?.executionState) query.append("executionState", params.executionState);
  if (params?.search) query.append("search", params.search);

  const res = await fetch(`${API_BASE}/agent/decisions?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch agent decisions");
  const json = await res.json();
  return json.data;
}

export async function triggerAgentCycle(): Promise<AgentCycleSummary> {
  const res = await fetch(`${API_BASE}/agent/run`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to execute agent cycle");
  const json = await res.json();
  return json.data;
}

export async function approveAgentDecision(id: string): Promise<AgentDecision> {
  const res = await fetch(`${API_BASE}/agent/approve/${id}`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to approve decision ${id}`);
  const json = await res.json();
  return json.data;
}

export async function rejectAgentDecision(id: string): Promise<AgentDecision> {
  const res = await fetch(`${API_BASE}/agent/reject/${id}`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to reject decision ${id}`);
  const json = await res.json();
  return json.data;
}