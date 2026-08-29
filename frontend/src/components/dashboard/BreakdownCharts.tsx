import React from "react";
import { BreakdownsData } from "../../types/index.js";
import { formatCompactINR } from "../../utils/formatters.js";
import { CreditCard, Building2, AlertCircle } from "lucide-react";

interface BreakdownChartsProps {
  breakdowns: BreakdownsData;
}

export const BreakdownCharts: React.FC<BreakdownChartsProps> = ({ breakdowns }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* 1. Payment Method Distribution */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Payment Method Breakdown
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Volume & failure rate distribution by rail
          </p>

          <div className="space-y-3">
            {breakdowns.paymentMethods.map((m) => (
              <div key={m.method} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-300 font-mono">{m.method}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{formatCompactINR(m.totalVolumeInr)}</span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        m.failureRatePct > 25
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {m.failureRatePct}% fail
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${100 - m.failureRatePct}%` }}
                    title="Success Rate"
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${m.failureRatePct}%` }}
                    title="Failure Rate"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-800 text-[11px] text-gray-500 flex justify-between">
          <span>Total Channels: {breakdowns.paymentMethods.length}</span>
          <span className="text-blue-400">UPI Dominant (~55%)</span>
        </div>
      </div>

      {/* 2. Top Failing Issuers */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Issuer / Bank Failure Rates
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Monitoring bank core banking system & gateway health
          </p>

          <div className="space-y-3">
            {breakdowns.issuers.slice(0, 6).map((b) => (
              <div
                key={b.bank}
                className={`p-2.5 rounded-lg border transition ${
                  b.isDegraded
                    ? "bg-rose-950/20 border-rose-800/40"
                    : "bg-gray-950/40 border-gray-800/60"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-200">{b.bank}</span>
                    {b.isDegraded && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                        Degraded
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-rose-400">
                      {b.failureRatePct}%
                    </span>
                    <span className="text-gray-500 text-[10px] block">
                      ({formatCompactINR(b.lostVolumeInr)} lost)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-800 text-[11px] text-gray-500 flex justify-between">
          <span>Outage Detection Threshold: 35%</span>
          <span className="text-amber-400">Live Health Check</span>
        </div>
      </div>

      {/* 3. Failure Categories */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Failure Root Causes
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Categorized breakdown of why payments failed
          </p>

          <div className="space-y-3">
            {breakdowns.failureReasons.slice(0, 5).map((f) => (
              <div key={f.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-medium text-[11px] truncate max-w-[180px]" title={f.category}>
                    {f.category.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-gray-400 font-mono text-[11px]">{f.count} txs</span>
                    <span className="font-mono text-rose-400 text-xs font-semibold">
                      {f.percentageOfFailures}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${Math.min(100, f.percentageOfFailures * 1.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-800 text-[11px] text-gray-500 flex justify-between">
          <span>Top Cause: {breakdowns.failureReasons[0]?.category.replace(/_/g, " ") || "N/A"}</span>
          <span className="text-indigo-400">AI Diagnostic Target</span>
        </div>
      </div>
    </div>
  );
};
