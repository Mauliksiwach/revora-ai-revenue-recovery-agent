import React, { useState, useEffect, useCallback } from "react";
import { TimelineEvent, AIPerformanceProof, TimelineFilterParams } from "../../types/timeline";
import { fetchTimelineEvents, fetchAIPerformanceProof } from "../../services/api";
import { AIPerformanceBanner } from "./AIPerformanceBanner";
import { MultiLingualOutreachSandbox } from "../outreach/MultiLingualOutreachSandbox";
import { TimelineEventCard } from "./TimelineEventCard";
import {
  History,
  Filter,
  Search,
  RefreshCw,
  ShieldCheck,
  CheckCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const DecisionTimelineDashboard: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [proof, setProof] = useState<AIPerformanceProof | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState<string>("");
  const [selectedEventType, setSelectedEventType] = useState<string>("ALL");
  const [selectedActor, setSelectedActor] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const loadTimelineData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: TimelineFilterParams = {
        page,
        limit: 15,
        search: search || undefined,
        eventType: selectedEventType !== "ALL" ? selectedEventType : undefined,
        actor: selectedActor !== "ALL" ? selectedActor : undefined,
      };

      const [eventsRes, proofRes] = await Promise.all([
        fetchTimelineEvents(params),
        fetchAIPerformanceProof(),
      ]);

      setEvents(eventsRes.data);
      setTotalPages(eventsRes.totalPages);
      setTotalCount(eventsRes.total);
      setProof(proofRes);
    } catch (err: any) {
      console.error("Failed to load timeline data:", err);
      setError(err.message || "Failed to load decision timeline data");
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedEventType, selectedActor]);

  useEffect(() => {
    loadTimelineData();
  }, [loadTimelineData]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedEventType("ALL");
    setSelectedActor("ALL");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Decision Timeline &amp; Outcome Proof
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">
              Immutable Audit Ledger
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            End-to-end cryptographic audit trail verifying every payment failure, AI decision, policy gate, and verified recovery outcome.
          </p>
        </div>

        <button
          onClick={loadTimelineData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 text-xs font-medium transition cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-xs text-rose-300">
          Failed to load timeline events: {error}
        </div>
      )}

      {/* AI Performance Proof KPI Banner */}
      {proof && <AIPerformanceBanner proof={proof} />}

      {/* Multi-Lingual Outreach Sandbox */}
      <MultiLingualOutreachSandbox />

      {/* Audit Ledger Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-bold text-white">
            Cryptographic Audit Ledger
          </h2>
          <span className="text-[11px] text-gray-400 font-mono">
            ({totalCount} events logged)
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search tx, customer, bank..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="bg-[#111622] border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-gray-200 text-xs focus:outline-none focus:border-blue-500 w-48 sm:w-56"
            />
          </div>

          {/* Event Type Filter */}
          <select
            value={selectedEventType}
            onChange={(e) => {
              setSelectedEventType(e.target.value);
              setPage(1);
            }}
            className="bg-[#111622] border border-gray-800 rounded-lg px-2.5 py-1.5 text-gray-200 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="PAYMENT_RECOVERED">Payment Recovered</option>
            <option value="ACTION_EXECUTED">Action Executed</option>
            <option value="POLICY_VERIFIED">Policy Verified</option>
            <option value="SMART_SILENCE_ACTIVATED">Smart Silence Activated</option>
            <option value="HUMAN_APPROVAL_REQUESTED">Human Approval Requested</option>
            <option value="TRANSACTION_FAILED">Transaction Failed</option>
            <option value="RECOVERY_EXPIRED">Recovery Expired</option>
          </select>

          {/* Actor Filter */}
          <select
            value={selectedActor}
            onChange={(e) => {
              setSelectedActor(e.target.value);
              setPage(1);
            }}
            className="bg-[#111622] border border-gray-800 rounded-lg px-2.5 py-1.5 text-gray-200 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Actors</option>
            <option value="REVORA_AI">Revora AI</option>
            <option value="CUSTOMER">Customer</option>
            <option value="SYSTEM_GATEWAY">System Gateway</option>
            <option value="MERCHANT_ADMIN">Merchant Admin</option>
          </select>

          {(search || selectedEventType !== "ALL" || selectedActor !== "ALL") && (
            <button
              onClick={handleResetFilters}
              className="text-gray-400 hover:text-white text-xs underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Events Feed */}
      {loading && events.length === 0 ? (
        <div className="py-12 text-center text-gray-500 animate-pulse text-xs">
          Loading verified audit events...
        </div>
      ) : events.length === 0 ? (
        <div className="bg-[#111622] border border-gray-800 rounded-xl p-8 text-center text-gray-400 text-xs">
          No audit events found matching the specified filters.
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <TimelineEventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-800 text-xs text-gray-400">
          <span>
            Showing Page <strong className="text-white">{page}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong> ({totalCount} total events)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
