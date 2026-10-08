import React from "react";
import {
  AlertTriangle,
  ShieldOff,
  Activity,
  ChevronDown,
  ChevronUp,
  Brain,
  VolumeX,
  Zap,
} from "lucide-react";
import type { RevenueIncident } from "../../types/incident";
import { formatCompactINR } from "../../utils/formatters";

interface IncidentCardProps {
  incident: RevenueIncident;
  isExpanded: boolean;
  onToggle: () => void;
}

const severityConfig: Record<string, { bg: string; border: string; badge: string; text: string; glow: string }> = {
  CRITICAL: {
    bg: "from-red-950/50 via-gray-900 to-gray-900",
    border: "border-red-700/50",
    badge: "bg-red-500/20 text-red-300 border-red-500/40",
    text: "text-red-400",
    glow: "shadow-red-900/30",
  },
  HIGH: {
    bg: "from-rose-950/40 via-gray-900 to-gray-900",
    border: "border-rose-700/40",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    text: "text-rose-400",
    glow: "shadow-rose-900/20",
  },
  MEDIUM: {
    bg: "from-amber-950/30 via-gray-900 to-gray-900",
    border: "border-amber-700/30",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    text: "text-amber-400",
    glow: "",
  },
  LOW: {
    bg: "from-blue-950/20 via-gray-900 to-gray-900",
    border: "border-blue-700/20",
    badge: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    text: "text-blue-400",
    glow: "",
  },
};

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  isExpanded,
  onToggle,
}) => {
  const cfg = severityConfig[incident.severity] || severityConfig.LOW;

  return (
    <div
      className={`bg-gradient-to-r ${cfg.bg} border ${cfg.border} rounded-xl shadow-lg ${cfg.glow} transition-all`}
    >
      {/* Header Row */}
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-start md:items-center justify-between gap-4 text-left cursor-pointer"
      >
        <div className="flex items-start gap-3.5 flex-1">
          <div className={`p-2.5 rounded-lg bg-gray-800/80 ${cfg.text} border border-gray-700/50 shrink-0 mt-0.5`}>
            {incident.smartSilenceRecommended ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-bold text-white">{incident.title}</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${cfg.badge}`}>
                {incident.severity}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                incident.status === "ACTIVE"
                  ? "bg-red-500/10 text-red-300 border-red-500/20"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/20"
              }`}>
                {incident.status}
              </span>
              {incident.smartSilenceRecommended && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-purple-500/10 text-purple-300 border-purple-500/20 flex items-center gap-1">
                  <VolumeX className="w-3 h-3" /> SMART SILENCE
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
              {incident.aiDiagnosis.slice(0, 180)}...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-gray-500 block uppercase font-mono">Revenue at Risk</span>
            <span className={`text-lg font-extrabold font-mono ${cfg.text}`}>
              {formatCompactINR(incident.affectedRevenueInr)}
            </span>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-gray-500 block uppercase font-mono">Confidence</span>
            <span className="text-lg font-extrabold font-mono text-white">
              {incident.aiConfidencePct}%
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* Expanded Detail Section */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-800/60 pt-4">
          {/* AI Diagnosis */}
          <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                AI Diagnosis
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {incident.aiDiagnosis}
            </p>
          </div>

          {/* Evidence */}
          <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                Supporting Evidence
              </span>
            </div>
            <div className="space-y-2">
              {incident.evidence.map((ev, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-gray-900/60 rounded-lg px-3 py-2 border border-gray-800/50">
                  <span className="text-gray-400 font-medium">{ev.metricLabel}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-200 font-mono font-semibold">{ev.value}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      ev.significance === "STRONG"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : ev.significance === "MODERATE"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-gray-800 text-gray-500"
                    }`}>
                      {ev.significance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className={`rounded-xl p-4 border ${
            incident.smartSilenceRecommended
              ? "bg-purple-950/30 border-purple-800/40"
              : "bg-blue-950/30 border-blue-800/40"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {incident.smartSilenceRecommended ? (
                <ShieldOff className="w-4 h-4 text-purple-400" />
              ) : (
                <Zap className="w-4 h-4 text-blue-400" />
              )}
              <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                {incident.smartSilenceRecommended ? "Smart Silence Recommendation" : "Recovery Recommendation"}
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {incident.recommendation}
            </p>
          </div>

          {/* Metadata Footer */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 pt-2 border-t border-gray-800/40">
            <span>Incident ID: <span className="font-mono text-gray-400">{incident.id}</span></span>
            <span>Detected: <span className="text-gray-400">{new Date(incident.detectedAt).toLocaleTimeString()}</span></span>
            <span>Window: <span className="text-gray-400">{incident.timeWindowMinutes} min</span></span>
            <span>Txs Affected: <span className="text-gray-400">{incident.affectedTransactionsCount}</span></span>
            <span>Failure Rate: <span className="text-gray-400">{incident.failureRatePct}% (baseline {incident.baselineFailureRatePct}%)</span></span>
          </div>
        </div>
      )}
    </div>
  );
};