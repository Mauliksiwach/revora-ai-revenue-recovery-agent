import React, { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Send,
  MessageSquare,
  Mail,
  RefreshCw,
  PhoneCall,
  VolumeX,
  UserCheck,
  Building2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import type { RecoveryOpportunity, RecommendedStrategy } from "../../types/opportunity";
import { formatINR, formatCompactINR } from "../../utils/formatters";

interface OpportunityCardProps {
  opportunity: RecoveryOpportunity;
}

const strategyMeta: Record<
  RecommendedStrategy,
  { label: string; icon: React.FC<{ className?: string }>; bg: string; text: string; border: string }
> = {
  IMMEDIATE_PAYMENT_LINK: {
    label: "Payment Link",
    icon: Send,
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  WHATSAPP_NUDGE: {
    label: "WhatsApp Nudge",
    icon: MessageSquare,
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
  },
  EMAIL_RECOVERY: {
    label: "Email Recovery",
    icon: Mail,
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  SMART_RETRY: {
    label: "Smart Retry",
    icon: RefreshCw,
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
  },
  CONCIERGE_OUTREACH: {
    label: "Concierge Phone",
    icon: PhoneCall,
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  SMART_SILENCE: {
    label: "Smart Silence",
    icon: VolumeX,
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  DO_NOT_CONTACT: {
    label: "Do Not Contact",
    icon: VolumeX,
    bg: "bg-gray-800",
    text: "text-gray-400",
    border: "border-gray-700",
  },
};

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const meta = strategyMeta[opportunity.recommendedStrategy] || strategyMeta.WHATSAPP_NUDGE;
  const StrategyIcon = meta.icon;

  const scoreColor =
    opportunity.recoveryScorePct >= 75
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : opportunity.recoveryScorePct >= 50
      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
      : "text-rose-400 bg-rose-500/10 border-rose-500/20";

  return (
    <div className="bg-gray-900/60 border border-gray-800 hover:border-gray-700/80 rounded-xl transition shadow-sm overflow-hidden">
      <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Customer & Transaction Info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gray-800/80 border border-gray-700/50 flex items-center justify-center shrink-0 text-white font-bold text-sm">
            {opportunity.customerName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-bold text-white truncate">{opportunity.customerName}</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${scoreColor}`}>
                {opportunity.recoveryScorePct}% Recovery Score
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                opportunity.priority === "HIGH"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : opportunity.priority === "MEDIUM"
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                  : "bg-blue-500/10 text-blue-300 border-blue-500/20"
              }`}>
                {opportunity.priority} Priority
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-gray-500" />
                {opportunity.issuerBank} ({opportunity.paymentMethod})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-gray-500" />
                LTV: {formatCompactINR(opportunity.customerLtvInr)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-gray-500">
                <Clock className="w-3 h-3" />
                {new Date(opportunity.failedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Metrics & Strategy Pill */}
        <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 border-gray-800/60 pt-3 md:pt-0">
          <div className="text-left md:text-right">
            <span className="text-[10px] text-gray-500 block uppercase font-mono">Est. Recoverable</span>
            <span className="text-base font-extrabold font-mono text-emerald-400">
              {formatINR(opportunity.estimatedRecoverableInr)}
            </span>
            <span className="text-[10px] text-gray-500 block font-mono">
              of {formatINR(opportunity.amountInr)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${meta.bg} ${meta.text} ${meta.border}`}>
              <StrategyIcon className="w-3.5 h-3.5" />
              <span>{meta.label}</span>
            </span>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-800 text-gray-400 hover:text-white transition border border-gray-700/50 cursor-pointer"
              title="Toggle Score Rationale"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Rationale & Score Breakdown */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-3 border-t border-gray-800/60 bg-gray-950/40 space-y-4">
          {/* Rationale */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-3.5 text-xs">
            <div className="flex items-center gap-2 mb-1.5 text-indigo-400 font-bold uppercase text-[10px] tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Rationale &amp; Strategy Breakdown</span>
            </div>
            <p className="text-gray-300 leading-relaxed">{opportunity.strategyRationale}</p>
          </div>

          {/* Factor Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-gray-900/60 border border-gray-800/80 rounded-lg p-2.5">
              <span className="text-[10px] text-gray-500 block uppercase font-mono">Failure Code</span>
              <span className="text-sm font-bold text-white font-mono">{opportunity.scoreFactors.categoryScore}/100</span>
              <span className="text-[10px] text-gray-400 block truncate mt-0.5">{opportunity.failureCategory}</span>
            </div>

            <div className="bg-gray-900/60 border border-gray-800/80 rounded-lg p-2.5">
              <span className="text-[10px] text-gray-500 block uppercase font-mono">Customer LTV</span>
              <span className="text-sm font-bold text-white font-mono">{opportunity.scoreFactors.historyScore}/100</span>
              <span className="text-[10px] text-gray-400 block truncate mt-0.5">{formatCompactINR(opportunity.customerLtvInr)}</span>
            </div>

            <div className="bg-gray-900/60 border border-gray-800/80 rounded-lg p-2.5">
              <span className="text-[10px] text-gray-500 block uppercase font-mono">Recency Decay</span>
              <span className="text-sm font-bold text-white font-mono">{opportunity.scoreFactors.recencyScore}/100</span>
              <span className="text-[10px] text-gray-400 block truncate mt-0.5">Recent failure</span>
            </div>

            <div className="bg-gray-900/60 border border-gray-800/80 rounded-lg p-2.5">
              <span className="text-[10px] text-gray-500 block uppercase font-mono">Amount Elasticity</span>
              <span className="text-sm font-bold text-white font-mono">{opportunity.scoreFactors.amountScore}/100</span>
              <span className="text-[10px] text-gray-400 block truncate mt-0.5">{formatINR(opportunity.amountInr)}</span>
            </div>
          </div>

          {/* Customer contact meta */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 pt-1">
            <span>Tx ID: <span className="font-mono text-gray-400">{opportunity.transactionId}</span></span>
            <span>Contact: <span className="text-gray-400">{opportunity.customerEmail}</span> • <span className="text-gray-400">{opportunity.customerPhone}</span></span>
          </div>
        </div>
      )}
    </div>
  );
};