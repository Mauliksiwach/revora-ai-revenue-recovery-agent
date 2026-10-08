import React, { useState, useEffect, useCallback } from "react";
import {
  VolumeX,
  ShieldCheck,
  RefreshCw,
  Activity,
  AlertTriangle,
  Building2,
  Clock,
  Zap,
} from "lucide-react";
import type { SmartSilenceStatusSummary } from "../../types/smartsilence";
import { SwitchHealthCard } from "./SwitchHealthCard";
import { formatCompactINR } from "../../utils/formatters";
import {
  fetchSmartSilenceStatus,
  toggleSmartSilenceOverride,
} from "../../services/api";

export const SmartSilenceDashboard: React.FC = () => {
  const [summary, setSummary] = useState<SmartSilenceStatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetchSmartSilenceStatus();
      setSummary(res);
    } catch (err: any) {
      setError(err.message || "Failed to load Smart Silence status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleToggleOverride = async (bank: string) => {
    try {
      await toggleSmartSilenceOverride(bank);
      await loadStatus();
    } catch (err: any) {
      alert("Failed to toggle Smart Silence override: " + err.message);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Smart Silence &amp; Incident Cooldown
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase font-mono">
              Signature Outage Protection
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Signature &quot;Do Nothing&quot; intelligence suppressing customer outreach during bank CBS timeouts and multi-rail gateway degradation.
          </p>
        </div>

        <button
          onClick={loadStatus}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 text-xs font-medium transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Switch Health</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <VolumeX className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                Outreach Suppression State
              </span>
            </div>
            <span className={`text-2xl font-extrabold font-mono ${summary.isGlobalSmartSilenceActive ? "text-purple-400" : "text-emerald-400"}`}>
              {summary.isGlobalSmartSilenceActive ? "ACTIVE" : "STANDBY"}
            </span>
            <p className="text-[10px] text-gray-500 mt-1.5 font-mono">
              {summary.isGlobalSmartSilenceActive ? "Outages detected" : "All switches healthy"}
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-rose-400" />
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                Degraded Bank Switches
              </span>
            </div>
            <span className="text-2xl font-extrabold text-rose-400 font-mono">
              {summary.activeDegradedSwitchesCount}
            </span>
            <p className="text-[10px] text-gray-500 mt-1.5">Exceeding 35% failure rate</p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                Shielded Revenue
              </span>
            </div>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              {formatCompactINR(summary.totalShieldedRevenueInr)}
            </span>
            <p className="text-[10px] text-gray-500 mt-1.5">Protected from failure spam</p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">
                Shielded Customers
              </span>
            </div>
            <span className="text-2xl font-extrabold text-white font-mono">
              {summary.totalShieldedTransactionsCount}
            </span>
            <p className="text-[10px] text-gray-500 mt-1.5">Suppressed buyers</p>
          </div>
        </div>
      )}

      {/* Global Smart Silence Active Alert Banner */}
      {summary?.isGlobalSmartSilenceActive && (
        <div className="bg-gradient-to-r from-purple-950/50 via-gray-900 to-indigo-950/40 border border-purple-800/60 rounded-xl p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-purple-900/20">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 shrink-0">
              <VolumeX className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Smart Silence Automated Cooldown Active
                <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  {summary.activeDegradedSwitchesCount} BANK SWITCHES AFFECTED
                </span>
              </h3>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed max-w-2xl">
                Revora Intelligence is actively suppressing customer recovery outreach for degraded bank switches.
                Outreach pipelines will automatically resume when issuer failure rates fall below baseline.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bank Switch Health Grid */}
      {summary && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white tracking-wide">
              Indian Bank Switch Health Monitor
            </h2>
            <span className="text-[10px] text-gray-500 font-mono">
              Rolling 30-min window • Last checked: {new Date(summary.lastCheckedAt).toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summary.switchHealthList.map((sw) => (
              <SwitchHealthCard
                key={sw.bank}
                switchHealth={sw}
                onToggleOverride={handleToggleOverride}
              />
            ))}
          </div>
        </div>
      )}

      {/* Incident Event Timeline */}
      {summary && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Smart Silence Incident Event History
            </h2>
            <span className="text-[10px] text-gray-500 font-mono">Automated Audit Log</span>
          </div>

          {summary.recentEvents.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">No recent Smart Silence events recorded.</p>
          ) : (
            <div className="space-y-3">
              {summary.recentEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-gray-950/60 border border-gray-800/80 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono uppercase">
                      {ev.eventType}
                    </span>
                    <span className="font-bold text-white">{ev.bank} Switch</span>
                    <span className="text-gray-400 font-mono">{ev.reason}</span>
                  </div>

                  <span className="text-gray-500 text-[11px] font-mono shrink-0">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};