import React from "react";
import { Stethoscope, Clock, Users } from "lucide-react";
import type { OverviewResponse } from "../types/admin.types";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  glow: string;
  sub?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  accent,
  glow,
  sub,
}) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-gray-800/60 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl p-6 group hover:border-gray-700/80 transition-all duration-300`}
  >
    {/* Glow blob */}
    <div
      className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity ${glow}`}
    />

    <div className="relative z-10">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accent}`}
      >
        {icon}
      </div>
      <p className="text-3xl font-bold text-white tabular-nums mb-1">
        {value.toLocaleString("en-IN")}
      </p>
      <p className="text-sm font-medium text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  </div>
);

interface Props {
  data: OverviewResponse;
}

const OverviewCards: React.FC<Props> = ({ data }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <StatCard
      label="Total Doctors"
      value={data.totalDoctors}
      icon={<Stethoscope size={18} className="text-blue-400" />}
      accent="bg-blue-500/10 border border-blue-500/20"
      glow="bg-blue-500"
      sub="Registered on platform"
    />
    <StatCard
      label="Pending Verifications"
      value={data.pendingVerifications}
      icon={<Clock size={18} className="text-amber-400" />}
      accent="bg-amber-500/10 border border-amber-500/20"
      glow="bg-amber-500"
      sub="Awaiting admin review"
    />
    <StatCard
      label="Total Patients"
      value={data.totalPatients}
      icon={<Users size={18} className="text-emerald-400" />}
      accent="bg-emerald-500/10 border border-emerald-500/20"
      glow="bg-emerald-500"
      sub="Registered on platform"
    />
  </div>
);

export default OverviewCards;
