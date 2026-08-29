import React from "react";
import { Transaction } from "../../types/index.js";
import { formatINR, formatDateTime } from "../../utils/formatters.js";
import { StatusBadge, MethodBadge } from "../common/Badge.js";
import { ChevronLeft, ChevronRight, Eye, AlertCircle, ArrowUpDown } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onSelectTransaction: (transaction: Transaction) => void;
  sortBy: string;
  sortOrder: string;
  onSortChange: (field: "createdAt" | "amountInr" | "retryCount") => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  total,
  page,
  limit,
  totalPages,
  onPageChange,
  onSelectTransaction,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header Info */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            Live Transaction Ledger
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total.toLocaleString()} transactions
          </p>
        </div>

        <div className="text-xs text-gray-500 font-mono">
          Page {page} of {totalPages}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-950/80 border-b border-gray-800 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Customer</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-white transition"
                onClick={() => onSortChange("amountInr")}
              >
                <div className="flex items-center gap-1">
                  <span>Amount</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Rail & Bank</th>
              <th className="py-3 px-4">Diagnostic / Error</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-white transition text-center"
                onClick={() => onSortChange("retryCount")}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Retries</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-white transition"
                onClick={() => onSortChange("createdAt")}
              >
                <div className="flex items-center gap-1">
                  <span>Timestamp</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 font-sans">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-gray-600" />
                    <p className="font-semibold text-gray-400">No transactions match this filter criteria</p>
                    <p className="text-xs text-gray-600 max-w-sm">
                      Revora is actively monitoring payment rails. Adjust your search or filters to see more transactions.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="hover:bg-gray-800/40 transition cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono text-[11px] text-gray-300 group-hover:text-blue-400 transition">
                    {tx.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-200">{tx.customerName}</div>
                    <div className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]">{tx.customerEmail}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white text-xs">
                    {formatINR(tx.amountInr)}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <MethodBadge method={tx.paymentMethod} />
                      <span className="text-[11px] font-semibold text-gray-300">{tx.issuerBank}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {tx.failureReason ? (
                      <span className="text-[11px] text-rose-300 truncate max-w-[220px] block" title={tx.failureReason}>
                        {tx.failureReason}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-xs text-gray-400">
                    {tx.retryCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
                        {tx.retryCount}x
                      </span>
                    ) : (
                      "0"
                    )}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-gray-400 font-mono">
                    {formatDateTime(tx.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransaction(tx);
                      }}
                      className="p-1.5 rounded bg-gray-800/80 hover:bg-blue-600 text-gray-400 hover:text-white transition cursor-pointer"
                      title="Inspect Transaction"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-800 bg-gray-950/40 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-750 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer border border-gray-700/60"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-750 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer border border-gray-700/60"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
