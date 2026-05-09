import React from "react";
import { BLOOD_GROUP_LABELS, GENDER_LABELS } from "../../types/patient.types";

interface QuickStatsProps {
  profile: {
    gender?: string;
    bloodGroup?: string;
  } | null;
  address: {
    city?: string;
  } | null;
}

const QuickStats: React.FC<QuickStatsProps> = ({ profile, address }) => {
  const stats = [
    {
      label: "Gender",
      value: profile?.gender ? GENDER_LABELS[profile.gender] : null,
    },
    {
      label: "Blood Group",
      value: profile?.bloodGroup
        ? BLOOD_GROUP_LABELS[profile.bloodGroup]
        : null,
    },
    {
      label: "City",
      value: address?.city ?? null,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-4 hover:border-white/20 transition-all duration-300 shadow-md"
        >
          <p className="text-xs text-gray-400/90 font-medium">{stat.label}</p>
          <p className="text-sm font-semibold text-gray-100 mt-1.5">
            {stat.value || "—"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
