import React from "react";
import { AlertTriangle, TrendingUp, Cpu, ChevronRight } from "lucide-react";
import { IssuerBreakdown } from "../../types/index.js";
import { formatCompactINR } from "../../utils/formatters.js";

interface IncidentAlertProps {
  issuers: IssuerBreakdown[];
}

export const IncidentAlert: React.FC<IncidentAlertProps> = ({ issuers }) => {
  const degradedIssuer = issuers.find((i) => i.isDegraded);

  if (!degradedIssuer) return null;

  return (
    <div className="bg-gradient-to-r from-rose-950/40 via-gray-900 to-amber-950/30 border border-rose-800/40 rounded-xl p-4 mb-6 shadow-lg shadow-rose-950/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-white">
                Payment Incident Detected: <span className="text-rose-400">{degradedIssuer.bank} Issuer Outage Spike</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {degradedIssuer.failureRatePct}% Failure Rate
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Elevated failure volume detected in {degradedIssuer.bank} UPI switch ({degradedIssuer.failureCount} failed transactions, totaling {formatCompactINR(degradedIssuer.lostVolumeInr)} revenue at risk).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-gray-500 block uppercase font-mono">Revenue at Risk</span>
            <span className="text-sm font-bold text-rose-300 font-mono">
              {formatCompactINR(degradedIssuer.lostVolumeInr)}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Detective Ready (Phase 2)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
