import React, { useState, useEffect, useCallback } from "react";
import {
  Bot,
  Play,
  RefreshCw,
  ShieldCheck,
  Clock,
  VolumeX,
  AlertTriangle,
  Search,
  CheckCircle2,
  DollarSign,
  UserCheck,
} from "lucide-react";
import type { AgentCycleSummary, AgentPolicyStatus } from "../../types/agent";
import { DecisionCard } from "./DecisionCard";
import { formatCompactINR, formatINR } from "../../utils/formatters";
import {
  fetchAgentDecisions,
  triggerAgentCycle,
  approveAgentDecision,
  rejectAgentDecision,
} from "../../services/api";

export const RevoraAgentDashboard: React.FC = () => {
  const [summary, setSummary] = useState<AgentCycleSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AgentPolicyStatus | "ALL" | "PENDING">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadDecisions = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetchAgentDecisions({
        policyStatus: statusFilter !== "ALL" && statusFilter !== "PENDING" ? statusFilter : undefined,
        executionState: statusFilter === "PENDING" ? "PENDING_APPROVAL" : undefined,
        search: searchQuery || undefined,
      });
      setSummary(res);
    } catch (err: any) {
      setError(err.message || "Failed to load Revora Agent decisions");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadDecisions();
  }, [loadDecisions]);

  const handleRunAgentCycle = async () => {
    try {
      setIsRunning(true);
      setError(null);
      const res = await triggerAgentCycle();
      setSummary(res);
    } catch (err: any) {
      setError(err.message || "Failed to execute agent cycle");
    } finally {
      setIsRunning(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAgentDecision(id);
      await loadDecisions();
    } catch (err: any) {
      alert("Failed to approve decision: " + err.message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectAgentDecision(id);
      await loadDecisions();
    } catch (err: any) {
      alert("Failed to reject decision: " + err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Revora Agent Control Room
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-mono">
              Autonomous Bounded Agent
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Autonomous decision engine executing bounded actions with 4-point policy safety verification &amp; human approval guardrails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAgentCycle}
            disabled={isRunning || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-indigo-900/30"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? "animate-pulse" : ""}`} />
            <span>{isRunning ? "Executing Agent Cycle..." : "Run Agent Cycle"}</span>
          </button>

          <button
            onClick={loadDecisions}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition cursor-pointer"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                Total Decisions
              </span>
            </div>
            <span className="text-2xl font-extrabold text-white font-mono">
              {summary.totalDecisionsCount}
            </span>
            <p className="text-[10px] text-gray-500 mt-1.5">Evaluated across opportunities</p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                Actions Executed
              </span>
            </div>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {summary.approvedCount}
            </span>
            <p className="text-[10px] text-gray-500 mt-1.5 font-mono">
              {formatCompactINR(summary.executedRevenueInr)} revenue dispatched
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                Human Approval Queue
              </span>
            </div>
            <span className="text-2xl font-extrabold text-amber-400 font-mono">
              {summary.requiresHumanApprovalCount}
            </span>
            <p className="text-[10px] text-gray-500 mt-1.5 font-mono">
              High-ticket &ge; ₹50k ({formatCompactINR(summary.pendingApprovalRevenueInr)})
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <VolumeX className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                Smart Silence Suppressed
              </span>
            </div>
            <span className="text-2xl font-extrabold text-purple-300 font-mono">
              {summary.suppressedSmartSilenceCount}
            </span>
            <p className="text-[10px] text-gray-500 mt-1.5">Outage protection active</p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-950 p-1 rounded-lg border border-gray-800/80 w-full sm:w-auto overflow-x-auto">
          {(
            [
              { id: "ALL", label: "All Decisions" },
              { id: "PENDING", label: "Human Approval Queue" },
              { id: "APPROVED", label: "Executed" },
              { id: "SUPPRESSED_SMART_SILENCE", label: "Smart Silence" },
              { id: "BLOCKED_COOLDOWN", label: "Blocked Cooldown" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer shrink-0 ${
                statusFilter === t.id
                  ? "bg-gray-800 text-white shadow-sm border border-gray-700/50"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t.label}
              {t.id === "PENDING" && summary?.requiresHumanApprovalCount ? (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold font-mono">
                  {summary.requiresHumanApprovalCount}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer, action, tx ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-900/60 border border-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-xs text-rose-300 mb-6">
          {error}
        </div>
      )}

      {/* Decision List */}
      {summary && !loading && (
        <>
          {summary.decisions.length === 0 ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-12 text-center">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">No agent decisions found</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                No decisions match the selected status or search filter. Click &quot;Run Agent Cycle&quot; to execute a new evaluation pass.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 px-1 font-mono">
                <span>Showing {summary.decisions.length} agent decisions</span>
                <span>Last cycle: {new Date(summary.cycleTimestamp).toLocaleTimeString()}</span>
              </div>
              {summary.decisions.map((decision) => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};