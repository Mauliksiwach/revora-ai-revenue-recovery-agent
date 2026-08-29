import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/layout/Navbar.js";
import { Sidebar } from "./components/layout/Sidebar.js";
import { SimulationBanner } from "./components/layout/SimulationBanner.js";
import { MetricsOverviewCards } from "./components/dashboard/MetricsOverview.js";
import { TrendChart } from "./components/dashboard/TrendChart.js";
import { BreakdownCharts } from "./components/dashboard/BreakdownCharts.js";
import { IncidentAlert } from "./components/dashboard/IncidentAlert.js";
import { TransactionFilters } from "./components/transactions/TransactionFilters.js";
import { TransactionTable } from "./components/transactions/TransactionTable.js";
import { TransactionDetailDrawer } from "./components/transactions/TransactionDetailDrawer.js";
import {
  StatCardSkeleton,
  ChartSkeleton,
  TableSkeleton,
} from "./components/common/LoadingSkeleton.js";
import {
  fetchOverview,
  fetchTrends,
  fetchBreakdowns,
  fetchTransactions,
  regenerateSimulationData,
  fetchHealth,
} from "./services/api.js";
import {
  MetricsOverview,
  TrendPoint,
  BreakdownsData,
  Transaction,
  TransactionFilterState,
} from "./types/index.js";
import { AlertCircle, RefreshCw } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<string>("command_center");
  const [serverConnected, setServerConnected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [metrics, setMetrics] = useState<MetricsOverview | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [breakdowns, setBreakdowns] = useState<BreakdownsData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Selected Transaction for Drawer
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Filter state
  const [filters, setFilters] = useState<TransactionFilterState>({
    page: 1,
    limit: 15,
    search: "",
    status: "ALL",
    method: "ALL",
    issuer: "ALL",
    failureCategory: "ALL",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [healthRes, overviewRes, trendsRes, breakdownRes, txsRes] = await Promise.all([
        fetchHealth().catch(() => ({ status: "OFFLINE", service: "Revora" })),
        fetchOverview(),
        fetchTrends(2),
        fetchBreakdowns(),
        fetchTransactions(filters),
      ]);

      setServerConnected(healthRes.status === "HEALTHY");
      setMetrics(overviewRes);
      setTrends(trendsRes);
      setBreakdowns(breakdownRes);
      setTransactions(txsRes.data);
      setTotalTransactions(txsRes.meta.total);
      setTotalPages(txsRes.meta.totalPages);
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError(err.message || "Failed to connect to Revora backend API");
      setServerConnected(false);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (newFilters: Partial<TransactionFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 15,
      search: "",
      status: "ALL",
      method: "ALL",
      issuer: "ALL",
      failureCategory: "ALL",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const handleSortChange = (field: "createdAt" | "amountInr" | "retryCount") => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "desc" ? "asc" : "desc",
      page: 1,
    }));
  };

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      await regenerateSimulationData(1200);
      await loadData();
    } catch (err: any) {
      alert("Failed to regenerate data: " + err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar serverConnected={serverConnected} />

      {/* Simulation Banner */}
      <SimulationBanner
        onRegenerate={handleRegenerate}
        isRegenerating={isRegenerating}
        totalTransactions={metrics?.totalTransactions}
      />

      {/* Main Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Workspace Canvas */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Page Heading */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                  Revenue Command Center
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-mono">
                  Live Monitoring
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Real-time visibility into payment failure rates, revenue at risk, and failure root causes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 text-xs font-medium transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh Feed</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 mb-6 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Revora backend offline or unreachable.</strong> Ensure backend server is running on port 5000 (`npm run dev:backend`).
                </span>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-white rounded font-medium cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Incident Alert if issuer degradation detected */}
          {breakdowns && <IncidentAlert issuers={breakdowns.issuers} />}

          {/* Metric KPI Cards */}
          {loading && !metrics ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          ) : metrics ? (
            <MetricsOverviewCards metrics={metrics} />
          ) : null}

          {/* Visual Trend Chart */}
          {loading && trends.length === 0 ? (
            <ChartSkeleton />
          ) : (
            <TrendChart trends={trends} />
          )}

          {/* Breakdowns Row (Methods, Issuers, Categories) */}
          {breakdowns && <BreakdownCharts breakdowns={breakdowns} />}

          {/* Transaction Explorer Header */}
          <div className="pt-2 pb-3">
            <h2 className="text-base font-bold text-white tracking-wide">
              Transaction Explorer & Failure Inspector
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Filter, search, and deep-dive into individual failed payment lifecycles and gateway error codes.
            </p>
          </div>

          {/* Filters Bar */}
          <TransactionFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* Transaction Table */}
          {loading && transactions.length === 0 ? (
            <TableSkeleton />
          ) : (
            <TransactionTable
              transactions={transactions}
              total={totalTransactions}
              page={filters.page}
              limit={filters.limit}
              totalPages={totalPages}
              onPageChange={(p) => handleFilterChange({ page: p })}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSortChange={handleSortChange}
            />
          )}
        </main>
      </div>

      {/* Transaction Detail Drawer */}
      <TransactionDetailDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}

export default App;
