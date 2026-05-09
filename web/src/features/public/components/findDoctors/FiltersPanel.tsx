import React from "react";
import { IndianRupee } from "lucide-react";
import {
  type Specialization,
  SPECIALIZATION_LABELS,
} from "../../../doctor/types/doctor.types";

const ALL_SPECIALIZATIONS = Object.keys(
  SPECIALIZATION_LABELS,
) as Specialization[];

interface FiltersPanelProps {
  specialization: string;
  city: string;
  maxFees: string;
  onSpecializationChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onMaxFeesChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  showClear: boolean;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  specialization,
  city,
  maxFees,
  onSpecializationChange,
  onCityChange,
  onMaxFeesChange,
  onApply,
  onClear,
  showClear,
  onKeyDown,
}) => (
  <div className="bg-gray-900/60 border border-gray-700/60 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
      Refine Results
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-400">
          Specialization
        </label>
        <select
          value={specialization}
          onChange={(e) => onSpecializationChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
        >
          <option value="">All specializations</option>
          {ALL_SPECIALIZATIONS.map((s) => (
            <option key={s} value={s}>
              {SPECIALIZATION_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-400">City</label>
        <input
          type="text"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="e.g. Kolkata"
          className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-400">
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
            onKeyDown={onKeyDown}
            placeholder="e.g. 1000"
            min={0}
            className="w-full pl-8 pr-3 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>
    </div>
    <div className="flex gap-2 pt-1">
      <button
        onClick={onApply}
        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/30"
      >
        Apply Filters
      </button>
      {showClear && (
        <button
          onClick={onClear}
          className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600 text-sm rounded-xl transition-all"
        >
          Clear All
        </button>
      )}
    </div>
  </div>
);

export default FiltersPanel;
