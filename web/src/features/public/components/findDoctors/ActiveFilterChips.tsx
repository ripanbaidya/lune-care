import React from "react";
import { X } from "lucide-react";
import {
  type Specialization,
  SPECIALIZATION_LABELS,
} from "../../../doctor/types/doctor.types";

interface AppliedFilters {
  name: string;
  specialization: string;
  city: string;
  maxFees: string;
}

interface ActiveFilterChipsProps {
  applied: AppliedFilters;
  onRemoveName: () => void;
  onRemoveSpecialization: () => void;
  onRemoveCity: () => void;
  onRemoveMaxFees: () => void;
  onClearAll: () => void;
}

const Chip: React.FC<{ label: string; onRemove: () => void }> = ({
  label,
  onRemove,
}) => (
  <span className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 border border-blue-500/25 text-blue-300 px-3 py-1.5 rounded-full font-medium transition-all hover:bg-blue-500/15">
    {label}
    <button
      onClick={onRemove}
      className="text-blue-400 hover:text-blue-200 transition-colors ml-0.5"
      aria-label="Remove filter"
    >
      <X size={10} />
    </button>
  </span>
);

const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  applied,
  onRemoveName,
  onRemoveSpecialization,
  onRemoveCity,
  onRemoveMaxFees,
  onClearAll,
}) => {
  const hasAny = !!(
    applied.name ||
    applied.specialization ||
    applied.city ||
    applied.maxFees
  );
  if (!hasAny) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-600 font-medium">Active:</span>
      {applied.name && (
        <Chip label={`"${applied.name}"`} onRemove={onRemoveName} />
      )}
      {applied.specialization && (
        <Chip
          label={
            SPECIALIZATION_LABELS[applied.specialization as Specialization] ??
            applied.specialization
          }
          onRemove={onRemoveSpecialization}
        />
      )}
      {applied.city && (
        <Chip label={`📍 ${applied.city}`} onRemove={onRemoveCity} />
      )}
      {applied.maxFees && (
        <Chip label={`≤ ₹${applied.maxFees}`} onRemove={onRemoveMaxFees} />
      )}
      <button
        onClick={onClearAll}
        className="text-xs text-red-400/70 hover:text-red-400 flex items-center gap-0.5 ml-1 transition-colors"
      >
        <X size={10} /> Clear all
      </button>
    </div>
  );
};

export default ActiveFilterChips;
