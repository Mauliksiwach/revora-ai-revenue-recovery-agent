import React from "react";
import { AIPerformanceProof } from "../../types/timeline";
import {
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
  Award,
} from "lucide-react";

interface AIPerformanceBannerProps {
  proof: AIPerformanceProof;
}

export const AIPerformanceBanner: React.FC<AIPerformanceBannerProps> = ({ proof }) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Recovery Accuracy */}
        <div className="bg-[#111622] border border-gray-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Prediction Accuracy
            </span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white font-mono">
              {proof.overallAccuracyRatePct}%
            </div>
            <p className="text-[10px] text-emerald-400 font-medium mt-0.5">
              High P_rec conversions
            </p>
          </div>
        </div>

        {/* Metric 2: False Positive Rate */}
        <div className="bg-[#111622] border border-gray-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              False Positive Rate
            </span>
            <ShieldAlert className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white font-mono">
              {proof.falsePositiveRatePct}%
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
              Terminal failure rate
            </p>
          </div>
        </div>

        {/* Metric 3: Total Recovered */}
        <div className="bg-[#111622] border border-gray-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Revenue Recovered
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono">
              ₹{proof.totalRecoveredRevenueInr.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
              {proof.recoveryBreakdown.recoveredCount} orders revived
            </p>
          </div>
        </div>

        {/* Metric 4: Shielded Revenue */}
        <div className="bg-[#111622] border border-gray-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Shielded from Outage
            </span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-purple-300 font-mono">
              ₹{proof.totalShieldedRevenueInr.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-purple-400 font-medium mt-0.5">
              38% spam prevented
            </p>
          </div>
        </div>

        {/* Metric 5: Net ROI Multiplier */}
        <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/30 border border-blue-800/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-300 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Net ROI Multiplier
            </span>
            <Award className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-white font-mono">
              {proof.netRoiMultiplier}x
            </div>
            <p className="text-[10px] text-blue-400 font-medium mt-0.5">
              Net recovered vs API cost
            </p>
          </div>
        </div>
      </div>

      {/* Model Calibration Breakdown */}
      <div className="bg-[#111622] border border-gray-800 rounded-xl p-4 text-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white text-xs">
              Model Calibration &amp; Conversion Verification
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            Predicted Probability vs Empirical Recovery
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {proof.confidenceCalibration.map((c, i) => (
            <div
              key={i}
              className="bg-gray-900/60 border border-gray-800/80 rounded-lg p-2.5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-mono font-bold text-white">{c.bracket}</span>
                <span className="text-[10px] text-gray-500 font-mono">
                  n={c.sampleSize}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Predicted: {c.predictedProbPct}%</span>
                  <span className="text-emerald-400 font-semibold">
                    Actual: {c.actualRecoveryPct}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, c.actualRecoveryPct)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
