import React from "react";
import {
  Building2,
  VolumeX,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from "lucide-react";
import type { BankSwitchHealth } from "../../types/smartsilence";

interface SwitchHealthCardProps {
  switchHealth: BankSwitchHealth;
  onToggleOverride: (bank: string) => void;
}

export const SwitchHealthCard: React.FC<SwitchHealthCardProps> = ({
  switchHealth,
  onToggleOverride,
}) => {
  const isOutage = switchHealth.status === "OUTAGE";
  const isDegraded = switchHealth.status === "DEGRADED";

  const cardBorder = switchHealth.isSuppressed
    ? "border-purple-800/40 bg-gradient-to-r from-purple-950/20 via-gray-900 to-gray-900"
    : "border-gray-800 bg-gray-900/60";

  return (
    <div className={`border rounded-xl p-4 md:p-5 transition shadow-sm ${cardBorder}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gray-800/80 border border-gray-700/50 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {switchHealth.bank.substring(0, 3)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {switchHealth.bank}
            </h3>
            <span className="text-[11px] text-gray-500 font-mono">
              Sample: {switchHealth.sampleSize} txs (30m)
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
            isOutage
              ? "bg-red-500/20 text-red-300 border-red-500/40"
              : isDegraded
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}
        >
          {isOutage ? (
            <AlertTriangle className="w-3 h-3" />
          ) : isDegraded ? (
            <Activity className="w-3 h-3" />
          ) : (
            <CheckCircle2 className="w-3 h-3" />
          )}
          {switchHealth.status}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="bg-gray-950/60 border border-gray-800/80 rounded-lg p-3 mb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-500 uppercase font-mono block">Failure Rate</span>
          <span
            className={`text-lg font-extrabold font-mono ${
              isOutage || isDegraded ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {switchHealth.failureRatePct}%
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-gray-500 uppercase font-mono block">Baseline</span>
          <span className="text-sm font-bold font-mono text-gray-400">
            {switchHealth.baselineFailureRatePct}%
          </span>
        </div>
      </div>

      {/* Suppression Rationale & Toggle */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-800/40">
        <div className="min-w-0 flex-1">
          {switchHealth.isSuppressed ? (
            <span className="text-[11px] text-purple-300 flex items-center gap-1 font-mono truncate">
              <VolumeX className="w-3.5 h-3.5 shrink-0" />
              Suppressed (Do Nothing)
            </span>
          ) : (
            <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono truncate">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Outreach Allowed
            </span>
          )}
        </div>

        <button
          onClick={() => onToggleOverride(switchHealth.bank)}
          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition cursor-pointer shrink-0 ${
            switchHealth.isSuppressed
              ? "bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border-purple-700/50"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700"
          }`}
        >
          {switchHealth.isSuppressed ? "Resume Outreach" : "Force Suppress"}
        </button>
      </div>
    </div>
  );
};