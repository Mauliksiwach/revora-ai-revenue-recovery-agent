import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Zap,
  Target,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import type { OpportunitySummary, OpportunityPriority } from "../../types/opportunity";
import { OpportunityCard } from "./OpportunityCard";
import { formatCompactINR, formatINR } from "../../utils/formatters";
import { fetchRecoveryOpportunities } from "../../services/api";

export const OpportunitiesDashboard: React.FC = () => {
  const [summary, setSummary] = useState<OpportunitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<OpportunityPriority | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadOpportunities = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetchRecoveryOpportunities({
        priority: priorityFilter === "ALL" ? undefined : priorityFilter,
        search: searchQuery || undefined,
      });
      setSummary(res);
    } catch (err: any) {
      setError(err.message || "Failed to load recovery opportunities");
    } finally {
      setLoading(false);
    }
  }, [priorityFilter, searchQuery]);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Recovery Opportunities
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">
              Phase 3 Scored Feed
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Dynamic recovery probability scoring (P<sub>recovery</sub>) based on customer LTV, failure code recoverability, recency, and amount elasticity.
          </p>
        </div>

        <button
          onClick={loadOpportunities}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 text-xs font-medium transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? "animate-spin" : ""}`} />
          <span>Recalculate Scores</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                Est. Recoverable
              </span>
            </div>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {formatCompactINR(summary.totalEstimatedRecoverableInr)}
            </span>
            <p className="text-[10px] text-gray-500 mt-1.5 font-mono">
              of {formatCompactINR(summary.totalRevenueAtRiskInr)} at risk
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                Total Opportunities
              </span>
            </div>
            <span className="text-2xl font-extrabold text-white font-mono">
              {summary.totalOpportunitiesCount}
            </span>
            <p className="text-[10px] text-gray-500 mt-1.5">Scored failed transactions</p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                Avg Recovery Score
              </span>
            </div>
            <span className="text-2xl font-extrabold text-amber-400 font-mono">
              {summary.averageRecoveryScorePct}%
            </span>
            <p className="text-[10px] text-gray-500 mt-1.5">Weighted probability mean</p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                High Priority
              </span>
            </div>
            <span className="text-2xl font-extrabold text-purple-300 font-mono">
              {summary.highPriorityCount}
            </span>
            <p className="text-[10px] text-gray-500 mt-1.5">Score &ge; 75%</p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Priority Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-950 p-1 rounded-lg border border-gray-800/80 w-full sm:w-auto">
          {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex-1 sm:flex-none ${
                priorityFilter === p
                  ? "bg-gray-800 text-white shadow-sm border border-gray-700/50"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {p === "ALL" ? "All Priorities" : `${p}`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer, bank, tx ID..."
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
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Opportunity List */}
      {summary && !loading && (
        <>
          {summary.opportunities.length === 0 ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-12 text-center">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">No matching opportunities</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                No failed transactions met the selected priority or search filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500 px-1 font-mono">
                <span>Showing {summary.opportunities.length} opportunities</span>
                <span>Sorted by Recovery Score &amp; Amount</span>
              </div>
              {summary.opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};