import React, { useState } from "react";
import { TimelineEvent } from "../../types/timeline";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Hash,
  Sparkles,
  User,
  Cpu,
  ArrowRight,
} from "lucide-react";

interface TimelineEventCardProps {
  event: TimelineEvent;
}

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const getSeverityBadge = () => {
    switch (event.severity) {
      case "RECOVERED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "SUCCESS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "BLOCKED":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "WARNING":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-gray-800 text-gray-300 border-gray-700";
    }
  };

  const getActorIcon = () => {
    switch (event.actor) {
      case "REVORA_AI":
        return <Sparkles className="w-3 h-3 text-blue-400" />;
      case "MERCHANT_ADMIN":
        return <User className="w-3 h-3 text-amber-400" />;
      case "SYSTEM_GATEWAY":
        return <Cpu className="w-3 h-3 text-purple-400" />;
      default:
        return <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-[#111622] rounded-xl border border-gray-800/80 hover:border-gray-700/80 transition shadow-sm p-4 text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity & Event Type Badge */}
          <span
            className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border uppercase ${getSeverityBadge()}`}
          >
            {event.eventType.replace(/_/g, " ")}
          </span>

          {/* Actor Badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-900 text-gray-400 border border-gray-800 text-[10px] font-medium">
            {getActorIcon()}
            <span>{event.actor.replace(/_/g, " ")}</span>
          </span>

          {/* Transaction ID */}
          <span className="font-mono text-gray-400 text-[11px]">
            {event.transactionId}
          </span>
        </div>

        {/* Timestamp & Amount */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-500" />
            {new Date(event.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
          <span className="font-bold text-white font-mono text-xs">
            ₹{event.amountInr.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Summary line */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-gray-200 font-medium text-xs leading-relaxed">
          {event.summary}
        </p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition cursor-pointer shrink-0"
          title="Toggle Details & Audit Proof"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Context Tags */}
      <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-gray-800/60 text-[10px] text-gray-400">
        <span className="bg-gray-900/90 px-1.5 py-0.5 rounded border border-gray-800">
          {event.customerName}
        </span>
        <span className="bg-gray-900/90 px-1.5 py-0.5 rounded border border-gray-800">
          {event.paymentMethod} • {event.issuer}
        </span>
        <div className="ml-auto flex items-center gap-1 text-[10px] font-mono text-gray-500">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Audit Hash:</span>
          <span className="text-gray-400">{event.auditHash}</span>
        </div>
      </div>

      {/* Expandable Evidence Narrative */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-800 space-y-2 bg-gray-900/40 -mx-4 -mb-4 p-4 rounded-b-xl">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Evidence &amp; Decision Rationale
            </span>
            <p className="text-gray-300 leading-relaxed font-mono text-[11px] bg-black/30 p-2.5 rounded-lg border border-gray-800/60">
              {event.evidenceNarrative}
            </p>
          </div>

          {event.metadata && (
            <div className="pt-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Event Metadata Payload
              </span>
              <pre className="text-[10px] font-mono text-gray-400 bg-black/40 p-2 rounded border border-gray-800/80 overflow-x-auto">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
