import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Brain,
  VolumeX,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import type { DetectionResult, RevenueIncident } from "../../types/incident";
import { IncidentCard } from "./IncidentCard";
import { formatCompactINR } from "../../utils/formatters";
import { fetchDetectionResults } from "../../services/api";

export const DetectiveDashboard: React.FC = () => {
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState("");

  const runDetection = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Progressive loading states
      setLoadingStage("Analyzing transaction patterns...");
      await new Promise((r) => setTimeout(r, 300));
      setLoadingStage("Checking issuer health signals...");
      await new Promise((r) => setTimeout(r, 250));
      setLoadingStage("Evaluating failure rate anomalies...");
      await new Promise((r) => setTimeout(r, 200));
      setLoadingStage("Applying root cause reasoning...");

      const result = await fetchDetectionResults();
      setDetectionResult(result);

      // Auto-expand first critical or high incident
      const firstCritical = result.incidents.find(
        (i) => i.severity === "CRITICAL" || i.severity === "HIGH"
      );
      if (firstCritical) setExpandedId(firstCritical.id);
    } catch (err: any) {
      setError(err.message || "Failed to run Revora Intelligence detection");
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  }, []);

  useEffect(() => {
    runDetection();
  }, [runDetection]);

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              AI Revenue Detective
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-mono">
              Revora Intelligence
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Automated pattern detection, issuer degradation diagnosis, and root cause reasoning with supporting evidence.
          </p>
        </div>
        <button
          onClick={runDetection}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 text-xs font-medium transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? "animate-spin" : ""}`} />
          <span>Re-run Detection</span>
        </button>
      </div>

      {/* Progressive Loading State */}
      {loading && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 mb-6 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-sm font-semibold text-white">{loadingStage || "Initializing Revora Intelligence..."}</p>
            <p className="text-xs text-gray-400 mt-1">Scanning payment data for revenue leakage patterns</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-5 mb-6 text-xs">
          <div className="flex items-center gap-2 text-rose-300 mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <strong>Revora couldn't complete the analysis.</strong>
          </div>
          <p className="text-gray-400 mb-3">
            The AI analysis service encountered an error. No recovery action was executed.
          </p>
          <button
            onClick={runDetection}
            className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-lg font-medium cursor-pointer text-xs"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* Summary Stats Bar */}
      {detectionResult && !loading && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Incidents Detected</span>
              </div>
              <span className="text-2xl font-extrabold text-white font-mono">{detectionResult.incidents.length}</span>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500 flex-wrap">
                {detectionResult.criticalCount > 0 && <span className="text-red-400">{detectionResult.criticalCount} Critical</span>}
                {detectionResult.highCount > 0 && <span className="text-rose-400">{detectionResult.highCount} High</span>}
                {detectionResult.mediumCount > 0 && <span className="text-amber-400">{detectionResult.mediumCount} Medium</span>}
                {detectionResult.lowCount > 0 && <span className="text-blue-400">{detectionResult.lowCount} Low</span>}
              </div>
            </div>

            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Revenue at Risk</span>
              </div>
              <span className="text-2xl font-extrabold text-rose-400 font-mono">
                {formatCompactINR(detectionResult.totalRevenueAtRiskInr)}
              </span>
              <p className="text-[10px] text-gray-500 mt-1.5">Across all detected incidents</p>
            </div>

            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <VolumeX className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Smart Silence</span>
              </div>
              <span className={`text-2xl font-extrabold font-mono ${detectionResult.smartSilenceActive ? "text-purple-400" : "text-gray-500"}`}>
                {detectionResult.smartSilenceActive ? "ACTIVE" : "INACTIVE"}
              </span>
              <p className="text-[10px] text-gray-500 mt-1.5">
                {detectionResult.smartSilenceActive ? "Suppressing customer outreach" : "Normal operations"}
              </p>
            </div>

            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">AI Engine</span>
              </div>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">ONLINE</span>
              <p className="text-[10px] text-gray-500 mt-1.5 font-mono">
                {new Date(detectionResult.analysisTimestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Smart Silence Global Banner */}
          {detectionResult.smartSilenceActive && (
            <div className="bg-gradient-to-r from-purple-950/40 via-gray-900 to-indigo-950/30 border border-purple-800/40 rounded-xl p-4 mb-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                <VolumeX className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Smart Silence Active
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                    SIGNATURE FEATURE
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Revora has detected a systemic infrastructure issue. All automated customer recovery outreach
                  is temporarily suppressed to prevent unnecessary contact during this degradation. Monitoring is active.
                </p>
              </div>
              <div className="text-right shrink-0 hidden sm:block">
                <span className="text-[10px] text-gray-500 block uppercase font-mono">Protected Revenue</span>
                <span className="text-lg font-extrabold text-purple-300 font-mono">
                  {formatCompactINR(detectionResult.totalRevenueAtRiskInr)}
                </span>
              </div>
            </div>
          )}

          {/* Incident List */}
          {detectionResult.incidents.length === 0 ? (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-12 text-center">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">No active incidents detected</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                Revora Intelligence is monitoring payment activity and will surface incidents when it detects
                meaningful failure patterns, issuer degradation, or revenue leakage anomalies.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white tracking-wide">Active Incidents</h2>
                <span className="text-[10px] text-gray-500 font-mono">
                  Rolling {detectionResult.incidents[0]?.timeWindowMinutes || 30}-min detection window
                </span>
              </div>
              {detectionResult.incidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  isExpanded={expandedId === incident.id}
                  onToggle={() =>
                    setExpandedId(expandedId === incident.id ? null : incident.id)
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};