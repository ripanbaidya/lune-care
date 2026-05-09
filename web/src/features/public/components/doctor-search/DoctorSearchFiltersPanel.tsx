import React from "react";
import { IndianRupee, X } from "lucide-react";
import {
  type Specialization,
  SPECIALIZATION_LABELS,
} from "../../../doctor/types/doctor.types";

const ALL_SPECIALIZATIONS = Object.keys(
  SPECIALIZATION_LABELS,
) as Specialization[];

interface DoctorSearchFiltersPanelProps {
  specialization: string;
  city: string;
  maxFees: string;
  onSpecializationChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onMaxFeesChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

const DoctorSearchFiltersPanel: React.FC<DoctorSearchFiltersPanelProps> = ({
  specialization,
  city,
  maxFees,
  onSpecializationChange,
  onCityChange,
  onMaxFeesChange,
  onClear,
  hasActiveFilters,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-800/60">
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
        Specialization
      </label>
      <select
        value={specialization}
        onChange={(e) => onSpecializationChange(e.target.value)}
        className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-700/60 rounded-xl text-sm text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all appearance-none cursor-pointer"
      >
        <option value="">All Specializations</option>
        {ALL_SPECIALIZATIONS.map((s) => (
          <option key={s} value={s}>
            {SPECIALIZATION_LABELS[s]}
          </option>
        ))}
      </select>
    </div>

    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
        City
      </label>
      <input
        type="text"
        value={city}
        onChange={(e) => onCityChange(e.target.value)}
        placeholder="e.g. Bengaluru"
        className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-700/60 rounded-xl text-sm text-gray-200 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
      />
    </div>

    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
        Max Fees (₹)
      </label>
      <div className="relative">
        <IndianRupee
          size={12}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
        <input
          type="number"
          value={maxFees}
          onChange={(e) => onMaxFeesChange(e.target.value)}
          placeholder="e.g. 1000"
          min={0}
          className="w-full pl-8 pr-3 py-2.5 bg-gray-800/80 border border-gray-700/60 rounded-xl text-sm text-gray-200 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
        />
      </div>
    </div>

    {hasActiveFilters && (
      <div className="sm:col-span-3 flex justify-end">
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 border border-gray-700/60 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-all"
        >
          <X size={11} /> Clear filters
        </button>
      </div>
    )}
  </div>
);

export default DoctorSearchFiltersPanel;
