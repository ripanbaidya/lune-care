import React from "react";
import { CheckCircle2, Clock, IndianRupee, MapPin, Phone } from "lucide-react";
import type { DoctorClinicResult } from "../../hooks/useDoctorSearch";
import { DAY_LABELS, type DayOfWeek } from "../../types/doctor.clinic.types";

interface ClinicSelectorProps {
  clinics: DoctorClinicResult[];
  selectedClinic: DoctorClinicResult | null;
  onSelect: (clinic: DoctorClinicResult) => void;
}

const ClinicSelector: React.FC<ClinicSelectorProps> = ({
  clinics,
  selectedClinic,
  onSelect,
}) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-1">
      Clinic Locations
    </p>
    {clinics.map((clinic) => {
      const isSelected = selectedClinic?.id === clinic.id;
      return (
        <button
          key={clinic.id}
          onClick={() => onSelect(clinic)}
          className={[
            "w-full text-left rounded-2xl border p-4 transition-all duration-200",
            isSelected
              ? "bg-blue-600/10 border-blue-500/40 shadow-md shadow-blue-600/10"
              : "bg-gradient-to-br from-gray-900/40 to-black/40 border-white/10 hover:border-white/20 hover:bg-white/5",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold truncate ${isSelected ? "text-blue-300" : "text-white"}`}
              >
                {clinic.name}
              </p>
              <p className="text-xs text-gray-500">{clinic.type}</p>
            </div>
            {isSelected && (
              <CheckCircle2
                size={16}
                className="text-blue-400 flex-shrink-0 mt-0.5"
              />
            )}
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <MapPin size={11} className="text-gray-600" />
              {clinic.addressLine}, {clinic.city}
            </div>
            {clinic.contactNumber && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Phone size={11} className="text-gray-600" />
                {clinic.contactNumber}
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={11} />
                {clinic.consultationDurationMinutes} min
              </span>
              <span className="text-sm font-semibold text-blue-400 flex items-center gap-0.5">
                <IndianRupee size={12} />
                {clinic.consultationFees}
              </span>
            </div>
            {clinic.schedules.filter((s) => s.active).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {clinic.schedules
                  .filter((s) => s.active)
                  .map((s) => (
                    <span
                      key={s.id}
                      className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full"
                    >
                      {DAY_LABELS[s.dayOfWeek as DayOfWeek]}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </button>
      );
    })}
  </div>
);

export default ClinicSelector;
