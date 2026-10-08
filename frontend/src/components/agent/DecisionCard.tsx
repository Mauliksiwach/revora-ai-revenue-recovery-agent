import React, { useState } from "react";
import {
  Bot,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  VolumeX,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Building2,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import type { AgentDecision, AgentPolicyStatus } from "../../types/agent";
import { formatINR, formatCompactINR } from "../../utils/formatters";

interface DecisionCardProps {
  decision: AgentDecision;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const statusConfig: Record<
  AgentPolicyStatus,
  { label: string; bg: string; text: string; border: string; icon: React.FC<{ className?: string }> }
> = {
  APPROVED: {
    label: "EXECUTED",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
  },
  REQUIRES_HUMAN_APPROVAL: {
    label: "AWAITING APPROVAL",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    icon: Clock,
  },
  SUPPRESSED_SMART_SILENCE: {
    label: "SMART SILENCE",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    icon: VolumeX,
  },
  BLOCKED_COOLDOWN: {
    label: "COOLDOWN BLOCKED",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    icon: AlertOctagon,
  },
  BLOCKED_MAX_CONTACT_CAP: {
    label: "MAX CAP BLOCKED",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
    icon: AlertOctagon,
  },
};

export const DecisionCard: React.FC<DecisionCardProps> = ({
  decision,
  onApprove,
  onReject,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusMeta = statusConfig[decision.policyStatus] || statusConfig.APPROVED;
  const StatusIcon = statusMeta.icon;

  const isPending = decision.executionState === "PENDING_APPROVAL";

  return (
    <div
      className={`bg-gray-900/60 border rounded-xl transition shadow-sm overflow-hidden ${
        isPending
          ? "border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-gray-900 to-gray-900 shadow-amber-900/10"
          : "border-gray-800 hover:border-gray-700/80"
      }`}
    >
      <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Customer & Decision Details */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="p-2.5 rounded-xl bg-gray-800/80 border border-gray-700/50 text-indigo-400 shrink-0 mt-0.5">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-bold text-white truncate">{decision.customerName}</h3>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase flex items-center gap-1 ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                <StatusIcon className="w-3 h-3" />
                {statusMeta.label}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Action: {decision.selectedAction}
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
              {decision.reasoningNarrative}
            </p>
          </div>
        </div>

        {/* Financial & Action Buttons */}
        <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end border-t md:border-t-0 border-gray-800/60 pt-3 md:pt-0">
          <div className="text-left md:text-right">
            <span className="text-[10px] text-gray-500 block uppercase font-mono">Tx Value</span>
            <span className="text-base font-extrabold font-mono text-white">
              {formatINR(decision.amountInr)}
            </span>
            <span className="text-[10px] text-emerald-400 block font-mono font-semibold">
              {decision.recoveryScorePct}% Recovery Score
            </span>
          </div>

          {/* Pending Approval Controls */}
          {isPending && onApprove && onReject ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApprove(decision.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-sm"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => onReject(decision.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/50 text-xs font-bold transition cursor-pointer"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-800 text-gray-400 hover:text-white transition border border-gray-700/50 cursor-pointer"
              title="Toggle Policy Gate Checklist"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Policy Check Details */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-3 border-t border-gray-800/60 bg-gray-950/40 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-gray-300 font-bold uppercase text-[10px] tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Policy Safety Gate Checklist</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              decision.policyCheck.cooldownPassed
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/5 border-rose-500/20 text-rose-400"
            }`}>
              <span className="font-mono text-[11px]">24h Cooldown</span>
              {decision.policyCheck.cooldownPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            </div>

            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              decision.policyCheck.maxCapPassed
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/5 border-rose-500/20 text-rose-400"
            }`}>
              <span className="font-mono text-[11px]">Max Contact Cap</span>
              {decision.policyCheck.maxCapPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            </div>

            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              decision.policyCheck.highTicketCheckPassed
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/5 border-amber-500/20 text-amber-400"
            }`}>
              <span className="font-mono text-[11px]">&lt; ₹50k Auto-Approve</span>
              {decision.policyCheck.highTicketCheckPassed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>

            <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
              decision.policyCheck.smartSilenceCheckPassed
                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                : "bg-purple-500/5 border-purple-500/20 text-purple-400"
            }`}>
              <span className="font-mono text-[11px]">Issuer Switch Health</span>
              {decision.policyCheck.smartSilenceCheckPassed ? <CheckCircle2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </div>
          </div>

          {/* Policy Notes */}
          {decision.policyCheck.policyNotes.length > 0 && (
            <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 space-y-1 text-gray-300">
              <span className="text-[10px] text-gray-500 font-mono uppercase block font-semibold">Policy Audit Trail</span>
              {decision.policyCheck.policyNotes.map((note, idx) => (
                <p key={idx} className="text-[11px] font-mono text-amber-300">• {note}</p>
              ))}
            </div>
          )}

          {/* Decision Metadata Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 pt-1">
            <span>Decision ID: <span className="font-mono text-gray-400">{decision.id}</span></span>
            <span>Customer: <span className="text-gray-400">{decision.customerEmail}</span></span>
            <span>Decided At: <span className="text-gray-400">{new Date(decision.decidedAt).toLocaleTimeString()}</span></span>
          </div>
        </div>
      )}
    </div>
  );
};