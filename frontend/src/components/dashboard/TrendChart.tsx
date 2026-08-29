import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendPoint } from "../../types/index.js";
import { formatCompactINR, formatTimeOnly } from "../../utils/formatters.js";
import { Activity, Clock } from "lucide-react";

interface TrendChartProps {
  trends: TrendPoint[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ trends }) => {
  const chartData = trends.map((t) => ({
    time: formatTimeOnly(t.timestamp),
    fullTimestamp: t.timestamp,
    failures: t.failureCount,
    successes: t.successCount,
    volume: t.revenueProcessedInr,
    lostVolume: t.revenueLostInr,
    failureRate: t.failureRatePct,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-950 border border-gray-800 p-3 rounded-lg shadow-xl text-xs space-y-1.5 font-sans min-w-[200px]">
          <div className="flex items-center justify-between border-b border-gray-800 pb-1.5 text-gray-400">
            <span className="font-semibold text-gray-200">Window: {label}</span>
            <span className="font-mono text-[11px]">{data.failureRate}% Failures</span>
          </div>
          <div className="flex justify-between text-emerald-400">
            <span>Successful Payments:</span>
            <span className="font-mono font-bold">{data.successes}</span>
          </div>
          <div className="flex justify-between text-rose-400">
            <span>Failed / Abandoned:</span>
            <span className="font-mono font-bold">{data.failures}</span>
          </div>
          <div className="flex justify-between text-gray-300 pt-1 border-t border-gray-800/60 font-mono">
            <span>Processed Volume:</span>
            <span>{formatCompactINR(data.volume)}</span>
          </div>
          <div className="flex justify-between text-rose-300 font-mono">
            <span>Lost Volume:</span>
            <span>{formatCompactINR(data.lostVolumeLost || data.lostVolume)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Payment Failures & Volume Over Time
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time tracking of successful vs failed transactions (2-hour rolling intervals)
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Success</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Failures / Drops</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorFailure" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#1F293D" }}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#1F293D" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="successes"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSuccess)"
              name="Success"
            />
            <Area
              type="monotone"
              dataKey="failures"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFailure)"
              name="Failures"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
