import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { TransactionFilterState } from "../../types/index.js";

interface TransactionFiltersProps {
  filters: TransactionFilterState;
  onFilterChange: (newFilters: Partial<TransactionFilterState>) => void;
  onReset: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-4 space-y-3">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Customer, Order ID, Failure reason..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="w-full bg-gray-950/80 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800/80 hover:bg-gray-750 text-gray-300 border border-gray-700/60 text-xs font-medium transition cursor-pointer"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Dropdown Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
        {/* Status */}
        <div>
          <label className="text-[10px] uppercase font-semibold text-gray-500 block mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
            className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="ABANDONED">Abandoned</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="text-[10px] uppercase font-semibold text-gray-500 block mb-1">
            Method
          </label>
          <select
            value={filters.method}
            onChange={(e) => onFilterChange({ method: e.target.value, page: 1 })}
            className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="DEBIT_CARD">Debit Card</option>
            <option value="NETBANKING">Netbanking</option>
            <option value="WALLET">Wallet</option>
            <option value="EMI">EMI</option>
          </select>
        </div>

        {/* Bank / Issuer */}
        <div>
          <label className="text-[10px] uppercase font-semibold text-gray-500 block mb-1">
            Bank / Issuer
          </label>
          <select
            value={filters.issuer}
            onChange={(e) => onFilterChange({ issuer: e.target.value, page: 1 })}
            className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Banks</option>
            <option value="HDFC">HDFC Bank</option>
            <option value="ICICI">ICICI Bank</option>
            <option value="SBI">State Bank of India</option>
            <option value="AXIS">Axis Bank</option>
            <option value="KOTAK">Kotak Mahindra</option>
            <option value="YES_BANK">Yes Bank</option>
            <option value="PNB">PNB</option>
            <option value="BOB">Bank of Baroda</option>
          </select>
        </div>

        {/* Failure Category */}
        <div>
          <label className="text-[10px] uppercase font-semibold text-gray-500 block mb-1">
            Failure Category
          </label>
          <select
            value={filters.failureCategory}
            onChange={(e) => onFilterChange({ failureCategory: e.target.value, page: 1 })}
            className="w-full bg-gray-950/80 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="ISSUER_OUTAGE">Issuer Outage</option>
            <option value="CUSTOMER_AUTHENTICATION">Customer Authentication</option>
            <option value="INSUFFICIENT_FUNDS">Insufficient Funds</option>
            <option value="CHECKOUT_ABANDONMENT">Checkout Abandonment</option>
            <option value="TECHNICAL_TIMEOUT">Technical Timeout</option>
            <option value="MANDATE_SUBSCRIPTION_ERROR">Subscription / Mandate</option>
            <option value="CARD_LIMIT_EXCEEDED">Card Limit Exceeded</option>
          </select>
        </div>
      </div>
    </div>
  );
};
