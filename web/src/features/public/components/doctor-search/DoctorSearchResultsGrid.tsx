import { IndianRupee, MapPin, Search, UserCircle } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import Spinner from "../../../../shared/components/ui/Spinner";
import { CLINIC_TYPE_LABELS } from "../../../doctor/types/doctor-clinic.types";
import {
  type Specialization,
  SPECIALIZATION_LABELS,
} from "../../../doctor/types/doctor.types";

interface Clinic {
  id: string;
  type: string;
  consultationFees: number;
  city: string;
  active: boolean;
}

export interface PublicDoctorResult {
  id: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  specialization: Specialization | null;
  qualification: string | null;
  yearsOfExperience: number | null;
  languagesSpoken: string[];
  clinics: Clinic[];
}

// Doctor Card
const DoctorCard: React.FC<{ doctor: PublicDoctorResult }> = ({ doctor }) => {
  const specLabel = doctor.specialization
    ? SPECIALIZATION_LABELS[doctor.specialization]
    : null;

  return (
    <Link
      to={`/doctors/${doctor.id}`}
      className="bg-gray-900/50 border border-gray-800/70 rounded-2xl p-5 hover:border-blue-500/35 hover:bg-gray-900/70 hover:shadow-2xl hover:shadow-blue-950/25 transition-all duration-200 group block"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {doctor.profilePhotoUrl ? (
          <img
            src={doctor.profilePhotoUrl}
            alt="Doctor"
            className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 border border-gray-700/50"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-blue-800/25 flex items-center justify-center flex-shrink-0">
            <UserCircle size={28} className="text-blue-400/60" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-100 group-hover:text-blue-300 transition-colors leading-tight">
            Dr. {doctor.firstName} {doctor.lastName}
          </p>
          {specLabel && (
            <p className="text-xs text-blue-400 font-medium mt-0.5">
              {specLabel}
            </p>
          )}
          <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1.5">
            {[
              doctor.qualification,
              doctor.yearsOfExperience != null
                ? `${doctor.yearsOfExperience} yrs exp`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      {/* Languages */}
      {doctor.languagesSpoken.length > 0 && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {doctor.languagesSpoken.slice(0, 3).map((lang) => (
            <span
              key={lang}
              className="text-xs bg-gray-800/70 border border-gray-700/50 text-gray-500 px-2 py-0.5 rounded-full"
            >
              {lang}
            </span>
          ))}
          {doctor.languagesSpoken.length > 3 && (
            <span className="text-xs text-gray-600">
              +{doctor.languagesSpoken.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Clinics */}
      {doctor.clinics.length > 0 && (
        <div className="space-y-1.5">
          {doctor.clinics.slice(0, 2).map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between bg-gray-800/50 border border-gray-700/40 rounded-xl px-3 py-2"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin size={10} className="text-gray-600 flex-shrink-0" />
                <span className="text-xs text-gray-400 truncate">
                  {c.city} · {CLINIC_TYPE_LABELS[c.type] || c.type}
                </span>
              </div>
              <div className="flex items-center gap-0.5 text-xs font-bold text-teal-400 flex-shrink-0 ml-2">
                <IndianRupee size={10} />
                {c.consultationFees.toLocaleString("en-IN")}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 text-xs text-blue-500 font-semibold group-hover:text-blue-400 transition-colors">
        View & Book →
      </div>
    </Link>
  );
};

// Results Grid
interface DoctorSearchResultsGridProps {
  doctors: PublicDoctorResult[];
  isLoading: boolean;
  isFetching: boolean;
  totalElements: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const DoctorSearchResultsGrid: React.FC<DoctorSearchResultsGridProps> = ({
  doctors,
  isLoading,
  isFetching,
  totalElements,
  hasActiveFilters,
  onClearFilters,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-900/80 border border-gray-800/60 flex items-center justify-center">
          <Search size={22} className="text-gray-700" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-400">
            No doctors found
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Try adjusting your search criteria.
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-500 hover:text-blue-400 underline underline-offset-2 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {isFetching ? (
            <span className="flex items-center gap-1.5">
              <Spinner size="sm" />
              <span className="animate-pulse">Searching...</span>
            </span>
          ) : (
            <>
              <span className="font-semibold text-gray-300">
                {totalElements}
              </span>{" "}
              doctor{totalElements !== 1 ? "s" : ""} found
            </>
          )}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </>
  );
};

export default DoctorSearchResultsGrid;
