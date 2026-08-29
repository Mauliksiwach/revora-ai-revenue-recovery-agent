import React from "react";
import { PaymentStatus, PaymentMethod } from "../../types/index.js";

interface StatusBadgeProps {
  status: PaymentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    SUCCESS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    FAILED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ABANDONED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    REFUNDED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  }[status] || "bg-gray-800 text-gray-300 border-gray-700";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide border ${config}`}>
      {status}
    </span>
  );
};

interface MethodBadgeProps {
  method: PaymentMethod;
}

export const MethodBadge: React.FC<MethodBadgeProps> = ({ method }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-gray-800/80 text-gray-300 border border-gray-700/60">
      {method}
    </span>
  );
};
