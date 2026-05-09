import React from "react";

export interface StatItem {
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
}

interface QuickStatsProps {
  stats: StatItem[];
}

const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {stats.map((stat) => (
      <div
        key={stat.label}
        className="bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-4 hover:border-white/20 transition-all duration-300 shadow-md"
      >
        {/* Icon + label row — icon is optional */}
        <div className="flex items-center gap-1.5 mb-1.5">
          {stat.icon && <span className="text-blue-400/80">{stat.icon}</span>}
          <p className="text-xs text-gray-400/90 font-medium">{stat.label}</p>
        </div>
        <p className="text-sm font-semibold text-gray-100 truncate">
          {stat.value || "—"}
        </p>
      </div>
    ))}
  </div>
);

export default QuickStats;
