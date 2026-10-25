import React, { useState, useEffect, useCallback } from "react";
import {
  FlaskConical,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Zap,
} from "lucide-react";
import type { RecoveryLabRunResult } from "../../types/recoverylab";
import { StrategyComparisonCard } from "./StrategyComparisonCard";
import { formatCompactINR, formatINR } from "../../utils/formatters";
import { runRecoveryLabSimulation } from "../../services/api";

export const RecoveryLabDashboard: React.FC = () => {
  const [result, setResult] = useState<RecoveryLabRunResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [outageSeverity, setOutageSeverity] = useState<"NONE" | "MILD" | "SEVERE">("MILD");

  const runSimulation = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await runRecoveryLabSimulation({ outageSeverity });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to run Recovery Lab simulation");
    } finally {
      setLoading(false);
    }
  }, [outageSeverity]);

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  const maxRevenue = result
    ? Math.max(...result.strategyResults.map((s) => s.recoveredRevenueInr))
    : 0;

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Recovery Lab Strategy Simulator
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase font-mono">
              Counterfactual Sandbox
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Side-by-side strategy benchmark comparing Naive Retry, Email, WhatsApp, Payment Links, and Revora AI Adaptive Agent on identical dataset scenarios.
          </p>
        </div>

        <button
          onClick={runSimulation}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-teal-900/30"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Run Counterfactual Simulation</span>
        </button>
      </div>

      {/* Scenario Configurator Bar */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-300 font-semibold">
          <Sliders className="w-4 h-4 text-teal-400" />
          <span>Simulated Issuer Outage Severity:</span>
        </div>

        <div className="flex items-center gap-2 bg-gray-950 p-1 rounded-lg border border-gray-800/80">
          {(["NONE", "MILD", "SEVERE"] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setOutageSeverity(sev)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                outageSeverity === sev
                  ? "bg-teal-900/50 text-teal-200 border border-teal-700/50 shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {sev === "NONE" ? "Normal (No Outage)" : sev === "MILD" ? "Mild Outage (HDFC)" : "Severe Multi-Bank Outage"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary ROI Advantage Card */}
      {result && (
        <div className="bg-gradient-to-r from-teal-950/40 via-gray-900 to-indigo-950/30 border border-teal-800/50 rounded-xl p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-teal-900/10">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-300 border border-teal-500/30 shrink-0 mt-0.5">
              <Sparkles className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Revora AI Adaptive Net Revenue Advantage
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  TOP PERFORMER
                </span>
              </h3>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed max-w-2xl">
                Revora AI Adaptive recovers <strong className="text-emerald-400">+{formatINR(result.revoraRevenueAdvantageInr)} more</strong> revenue than the next best single-channel strategy while preventing unnecessary customer contact spam during bank degradation.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 hidden sm:block">
            <span className="text-[10px] text-gray-500 block uppercase font-mono">Revenue Advantage</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">
              +{formatCompactINR(result.revoraRevenueAdvantageInr)}
            </span>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-900/60 border border-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-xs text-rose-300 mb-6">
          {error}
        </div>
      )}

      {/* Strategy Comparison Cards Feed */}
      {result && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1 font-mono">
            <span>Scenario: {result.scenarioName}</span>
            <span>Dataset: {result.totalFailedTransactionsCount} failed transactions ({formatCompactINR(result.totalRevenueAtRiskInr)} at risk)</span>
          </div>

          {result.strategyResults.map((strategy) => (
            <StrategyComparisonCard
              key={strategy.strategyType}
              strategy={strategy}
              maxRevenue={maxRevenue}
            />
          ))}
        </div>
      )}
    </div>
  );
};