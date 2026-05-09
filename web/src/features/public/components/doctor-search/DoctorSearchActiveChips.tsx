import React from "react";
import { X } from "lucide-react";
import {
  type Specialization,
  SPECIALIZATION_LABELS,
} from "../../../doctor/types/doctor.types";

interface DoctorSearchActiveChipsProps {
  name: string;
  specialization: string;
  city: string;
  maxFees: string;
  onClearName: () => void;
  onClearSpecialization: () => void;
  onClearCity: () => void;
  onClearMaxFees: () => void;
  onClearAll: () => void;
}

const Chip: React.FC<{ label: string; onRemove: () => void }> = ({
  label,
  onRemove,
}) => (
  <span className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-medium transition-all hover:bg-blue-500/15">
    {label}
    <button
      onClick={onRemove}
      className="text-blue-400/70 hover:text-blue-200 transition-colors"
      aria-label="Remove filter"
    >
      <X size={10} />
    </button>
  </span>
);

const DoctorSearchActiveChips: React.FC<DoctorSearchActiveChipsProps> = ({
  name,
  specialization,
  city,
  maxFees,
  onClearName,
  onClearSpecialization,
  onClearCity,
  onClearMaxFees,
  onClearAll,
}) => {
  const hasAny = !!(name || specialization || city || maxFees);
  if (!hasAny) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap px-4 pb-3">
      <span className="text-xs text-gray-600">Filters:</span>
      {name && <Chip label={`"${name}"`} onRemove={onClearName} />}
      {specialization && (
        <Chip
          label={
            SPECIALIZATION_LABELS[specialization as Specialization] ??
            specialization
          }
          onRemove={onClearSpecialization}
        />
      )}
      {city && <Chip label={`📍 ${city}`} onRemove={onClearCity} />}
      {maxFees && <Chip label={`≤ ₹${maxFees}`} onRemove={onClearMaxFees} />}
      <button
        onClick={onClearAll}
        className="text-xs text-red-400/60 hover:text-red-400 flex items-center gap-0.5 transition-colors"
      >
        <X size={10} /> Clear all
      </button>
    </div>
  );
};

export default DoctorSearchActiveChips;
