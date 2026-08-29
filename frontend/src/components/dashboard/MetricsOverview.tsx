import React from "react";
import { MetricsOverview } from "../../types/index.js";
import { formatCompactINR, formatINR } from "../../utils/formatters.js";
import {
  TrendingUp,
  AlertOctagon,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
} from "lucide-react";

interface MetricsOverviewProps {
  metrics: MetricsOverview;
}

export const MetricsOverviewCards: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  const cards = [
    {
      title: "Revenue Processed",
      value: formatCompactINR(metrics.revenueProcessedInr),
      exactValue: formatINR(metrics.revenueProcessedInr),
      subtitle: `${metrics.successfulPayments.toLocaleString()} successful payments`,
      icon: TrendingUp,
      accentColor: "text-emerald-400",
      bgGradient: "from-emerald-500/10 via-gray-900 to-gray-900",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Revenue at Risk",
      value: formatCompactINR(metrics.revenueAtRiskInr),
      exactValue: formatINR(metrics.revenueAtRiskInr),
      subtitle: `${(metrics.failedPayments + metrics.abandonedCheckouts).toLocaleString()} failed & abandoned`,
      icon: AlertOctagon,
      accentColor: "text-rose-400",
      bgGradient: "from-rose-500/10 via-gray-900 to-gray-900",
      borderColor: "border-rose-500/20",
    },
    {
      title: "Recovery Potential",
      value: formatCompactINR(metrics.estimatedRecoverableInr),
      exactValue: formatINR(metrics.estimatedRecoverableInr),
      subtitle: "AI-estimated recoverable value",
      icon: Sparkles,
      accentColor: "text-indigo-400",
      bgGradient: "from-indigo-500/10 via-gray-900 to-gray-900",
      borderColor: "border-indigo-500/20",
    },
    {
      title: "Payment Success Rate",
      value: `${metrics.successRatePct}%`,
      exactValue: `${metrics.successfulPayments} / ${metrics.totalTransactions} transactions`,
      subtitle: `${metrics.failureRatePct}% failure rate`,
      icon: CheckCircle2,
      accentColor: metrics.successRatePct > 70 ? "text-blue-400" : "text-amber-400",
      bgGradient: "from-blue-500/10 via-gray-900 to-gray-900",
      borderColor: "border-blue-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-gradient-to-b ${card.bgGradient} border ${card.borderColor} rounded-xl p-5 shadow-sm transition hover:border-gray-700`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg bg-gray-800/80 ${card.accentColor} border border-gray-700/50`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
                  {card.value}
                </span>
                <span className="text-[10px] text-gray-500 font-mono hidden sm:inline" title={card.exactValue}>
                  ({card.exactValue})
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
