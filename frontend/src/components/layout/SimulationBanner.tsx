import React from "react";
import { AlertCircle, RefreshCw, Database } from "lucide-react";

interface SimulationBannerProps {
  onRegenerate: () => void;
  isRegenerating: boolean;
  totalTransactions?: number;
}

export const SimulationBanner: React.FC<SimulationBannerProps> = ({
  onRegenerate,
  isRegenerating,
  totalTransactions,
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border-y border-amber-500/20 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-gray-300">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold uppercase tracking-wider text-[10px] border border-amber-500/30">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          Simulation Mode
        </span>
        <span className="text-gray-300">
          <strong className="text-gray-100">Synthetic Demo Scenario:</strong> Real-time Indian payment patterns, NPCI UPI throttle & issuer outage clusters for Razorpay AI Buildathon.
        </span>
      </div>

      <div className="flex items-center gap-4">
        {totalTransactions && (
          <span className="text-gray-400 hidden sm:inline-flex items-center gap-1">
            <Database className="w-3 h-3 text-blue-400" />
            <span>{totalTransactions.toLocaleString()} Simulated Events</span>
          </span>
        )}
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition disabled:opacity-50 text-xs font-medium cursor-pointer"
          title="Regenerate synthetic transactions with new anomaly spikes"
        >
          <RefreshCw className={`w-3 h-3 text-blue-400 ${isRegenerating ? "animate-spin" : ""}`} />
          <span>{isRegenerating ? "Regenerating..." : "Regenerate Dataset"}</span>
        </button>
      </div>
    </div>
  );
};
