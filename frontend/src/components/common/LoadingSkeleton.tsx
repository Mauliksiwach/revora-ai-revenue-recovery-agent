import React from "react";

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 animate-pulse space-y-3">
    <div className="h-4 bg-gray-800 rounded w-28" />
    <div className="h-8 bg-gray-750 rounded w-36" />
    <div className="h-3 bg-gray-800 rounded w-48" />
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 animate-pulse space-y-4 h-72">
    <div className="flex justify-between items-center">
      <div className="h-5 bg-gray-800 rounded w-40" />
      <div className="h-4 bg-gray-800 rounded w-20" />
    </div>
    <div className="h-48 bg-gray-800/40 rounded-lg" />
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 animate-pulse space-y-3">
    <div className="h-10 bg-gray-800 rounded" />
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-12 bg-gray-800/30 rounded" />
    ))}
  </div>
);
