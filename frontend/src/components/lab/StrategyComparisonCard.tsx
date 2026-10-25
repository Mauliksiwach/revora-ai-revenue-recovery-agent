import React from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Users,
} from "lucide-react";
import type { StrategySimulationResult } from "../../types/recoverylab";
import { formatCompactINR, formatINR } from "../../utils/formatters";

interface StrategyComparisonCardProps {
  strategy: StrategySimulationResult;
  maxRevenue: number;
}

const frictionConfig: Record<string, { label: string; text: string; bg: string }> = {
  NONE: { label: "Zero Friction", text: "text-gray-400", bg: "bg-gray-800/60" },
  LOW: { label: "Low Friction", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  MODERATE: { label: "Moderate Friction", text: "text-amber-400", bg: "bg-amber-500/10" },
  HIGH: { label: "High Friction", text: "text-rose-400", bg: "bg-rose-500/10" },
  SEVERE: { label: "Severe Churn Risk", text: "text-red-400", bg: "bg-red-500/20" },
};

export const StrategyComparisonCard: React.FC<StrategyComparisonCardProps> = ({
  strategy,
  maxRevenue,
}) => {
  const isRevora = strategy.isRecommended;
  const fMeta = frictionConfig[strategy.customerFrictionScore] || frictionConfig.LOW;

  const barPercent = maxRevenue > 0 ? Math.round((strategy.recoveredRevenueInr / maxRevenue) * 100) : 0;

  return (
    <div
      className={`border rounded-xl p-5 transition shadow-sm relative overflow-hidden ${
        isRevora
          ? "border-emerald-500/50 bg-gradient-to-r from-emerald-950/30 via-gray-900 to-indigo-950/20 shadow-emerald-900/10 ring-1 ring-emerald-500/30"
          : "border-gray-800 bg-gray-900/60"
      }`}
    >
      {/* Recommended Pill */}
      {isRevora && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-gray-950 text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl font-mono tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 fill-current" />
          Recommended Strategy
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          {strategy.name}
        </h3>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
          {strategy.description}
        </p>
      </div>

      {/* Visual Revenue Bar */}
      <div className="mb-4 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">Recovered Revenue</span>
          <span className={`font-mono font-extrabold ${isRevora ? "text-emerald-400 text-base" : "text-white"}`}>
            {formatINR(strategy.recoveredRevenueInr)} ({strategy.recoveryRatePct}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800/80">
          <div
            className={`h-full transition-all duration-500 ${
              isRevora
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : "bg-blue-600/80"
            }`}
            style={{ width: `${barPercent}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-800/60 text-xs">
        <div>
          <span className="text-[10px] text-gray-500 uppercase font-mono block">Outreach Contacts</span>
          <span className="text-sm font-bold text-gray-200 font-mono">
            {strategy.contactsInitiatedCount}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-gray-500 uppercase font-mono block">Spam Prevented</span>
          <span className="text-sm font-bold text-purple-300 font-mono">
            {strategy.unnecessaryContactsPreventedCount}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-gray-500 uppercase font-mono block">Estimated Cost</span>
          <span className="text-sm font-bold text-gray-300 font-mono">
            {formatINR(strategy.outreachCostInr)}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-gray-500 uppercase font-mono block">Net ROI</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">
            {strategy.netRevenueRoiMultiplier}x
          </span>
        </div>
      </div>

      {/* Customer Friction Badge */}
      <div className="mt-3 pt-3 border-t border-gray-800/40 flex items-center justify-between text-xs">
        <span className="text-gray-500 text-[11px]">Customer Friction Level:</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${fMeta.bg} ${fMeta.text} border-gray-700/50`}>
          {fMeta.label}
        </span>
      </div>
    </div>
  );
};