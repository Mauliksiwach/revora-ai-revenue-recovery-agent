import React from "react";
import { X, AlertTriangle, ShieldCheck, User, CreditCard, Clock, FileCode, Sparkles } from "lucide-react";
import { Transaction } from "../../types/index.js";
import { formatINR, formatDateTime } from "../../utils/formatters.js";
import { StatusBadge, MethodBadge } from "../common/Badge.js";

interface TransactionDetailDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0E1320] border-l border-gray-800 text-gray-200 shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-[#0E1320] z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-400">{transaction.id}</span>
                <StatusBadge status={transaction.status} />
              </div>
              <h2 className="text-xl font-bold text-white font-mono">
                {formatINR(transaction.amountInr)}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 flex-1">
            {/* Failure Alert Box if Failed */}
            {transaction.status === "FAILED" || transaction.status === "ABANDONED" ? (
              <div className="bg-rose-950/30 border border-rose-800/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{transaction.failureCategory?.replace(/_/g, " ") || "Payment Failed"}</span>
                </div>
                <p className="text-xs text-rose-200 leading-relaxed font-sans">
                  {transaction.failureReason}
                </p>
                {transaction.failureCode && (
                  <div className="pt-2 border-t border-rose-900/40 flex items-center justify-between text-[11px] font-mono text-rose-300/80">
                    <span>Gateway Code:</span>
                    <span className="bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800/40">
                      {transaction.failureCode}
                    </span>
                  </div>
                )}
              </div>
            ) : null}

            {/* Customer Profile */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                <User className="w-4 h-4 text-blue-400" />
                <span>Customer Profile</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 text-[10px] block">Customer Name</span>
                  <span className="font-medium text-gray-200">{transaction.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Customer ID</span>
                  <span className="font-mono text-gray-300">{transaction.customerId}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Email</span>
                  <span className="text-gray-300 truncate block">{transaction.customerEmail}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Phone</span>
                  <span className="font-mono text-gray-300">{transaction.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Payment Rail Details */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span>Payment Rail Details</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 text-[10px] block">Method</span>
                  <MethodBadge method={transaction.paymentMethod} />
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Issuer Bank</span>
                  <span className="font-bold text-gray-200">{transaction.issuerBank}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Order ID</span>
                  <span className="font-mono text-gray-300">{transaction.orderId}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Retry Attempts</span>
                  <span className="font-mono text-gray-200 font-semibold">{transaction.retryCount}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Created At</span>
                  <span className="text-gray-300 text-[11px]">{formatDateTime(transaction.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">Subscription</span>
                  <span className="text-gray-300">{transaction.isSubscription ? "Yes (Recurring)" : "One-time"}</span>
                </div>
              </div>
            </div>

            {/* Simulated Error Payload */}
            {transaction.errorPayload && (
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                  <FileCode className="w-4 h-4 text-gray-400" />
                  <span>Gateway Payload (Raw)</span>
                </div>
                <pre className="bg-black/50 p-3 rounded-lg text-[11px] font-mono text-gray-300 overflow-x-auto border border-gray-800/80">
                  {JSON.stringify(transaction.errorPayload, null, 2)}
                </pre>
              </div>
            )}

            {/* AI Agent Recovery Teaser */}
            <div className="bg-gradient-to-r from-blue-950/30 via-indigo-950/20 to-purple-950/30 border border-blue-800/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Revora Intelligence (Phase 3 Preview)</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Recovery probability scoring and autonomous recovery strategies (Smart Silence, WhatsApp links, Cooldown timers) activate in upcoming phases.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 bg-[#0E1320] flex items-center justify-between text-xs text-gray-500">
            <span>Revora Engine v1.0</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
