import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  IndianRupee,
  MapPin,
  Stethoscope,
  UserCircle,
} from "lucide-react";
import {
  type Specialization,
  SPECIALIZATION_LABELS,
} from "../../../doctor/types/doctor.types";
import Spinner from "../../../../shared/components/ui/Spinner";

interface Clinic {
  id: string;
  name: string;
  type: string;
  consultationFees: number;
  consultationDurationMinutes: number;
  city: string;
  state: string;
  active: boolean;
}

export interface DoctorResult {
  id: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  specialization: string | null;
  qualification: string | null;
  yearsOfExperience: number | null;
  bio: string | null;
  languagesSpoken: string[];
  clinics: Clinic[];
}

const DoctorCard: React.FC<{ doctor: DoctorResult }> = ({ doctor }) => {
  const navigate = useNavigate();
  const primaryClinic =
    doctor.clinics.find((c) => c.active) ?? doctor.clinics[0];
  const specLabel = doctor.specialization
    ? (SPECIALIZATION_LABELS[doctor.specialization as Specialization] ??
      doctor.specialization)
    : null;

  return (
    <button
      onClick={() => navigate(`/doctors/${doctor.id}`)}
      className="w-full text-left bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 hover:bg-blue-500/5 hover:shadow-xl hover:shadow-blue-950/20 transition-all duration-200 group"
    >
      {/* Doctor header */}
      <div className="flex items-start gap-3">
        {doctor.profilePhotoUrl ? (
          <img
            src={doctor.profilePhotoUrl}
            alt={`Dr. ${doctor.firstName}`}
            className="w-14 h-14 rounded-2xl object-cover border border-white/10 flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900/60 to-indigo-900/60 border border-white/10 flex items-center justify-center flex-shrink-0">
            <UserCircle size={26} className="text-blue-400/70" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">
            Dr. {doctor.firstName} {doctor.lastName}
          </p>
          {specLabel && (
            <span className="inline-block text-xs text-blue-400 font-medium mt-0.5">
              {specLabel}
            </span>
          )}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            {doctor.qualification && (
              <span className="text-xs text-gray-500">
                {doctor.qualification}
              </span>
            )}
            {doctor.yearsOfExperience != null && (
              <>
                <span className="text-gray-600">·</span>
                <span className="text-xs text-gray-500 flex items-center gap-0.5">
                  <Clock size={10} className="text-gray-600" />
                  {doctor.yearsOfExperience} yrs
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {doctor.bio && (
        <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
          {doctor.bio}
        </p>
      )}

      {/* Primary clinic strip */}
      {primaryClinic && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
            <MapPin size={11} className="flex-shrink-0 text-gray-600" />
            <span className="truncate">
              {primaryClinic.city}, {primaryClinic.state}
            </span>
          </div>
          <div className="flex items-center gap-0.5 text-sm font-bold text-teal-400 flex-shrink-0">
            <IndianRupee size={12} />
            {primaryClinic.consultationFees.toLocaleString("en-IN")}
          </div>
        </div>
      )}

      {/* Language pills */}
      {doctor.languagesSpoken.length > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {doctor.languagesSpoken.slice(0, 3).map((lang) => (
            <span
              key={lang}
              className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full"
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

      {/* CTA */}
      <div className="mt-3 text-xs text-blue-500 font-semibold group-hover:text-blue-400 transition-colors">
        View Profile & Book →
      </div>
    </button>
  );
};

interface FindDoctorsResultsGridProps {
  doctors: DoctorResult[];
  isLoading: boolean;
  isFetching: boolean;
  total: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const FindDoctorsResultsGrid: React.FC<FindDoctorsResultsGridProps> = ({
  doctors,
  isLoading,
  isFetching,
  total,
  hasActiveFilters,
  onClearFilters,
}) => {
  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 animate-pulse">
            Searching doctors...
          </p>
        </div>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Stethoscope size={26} className="text-gray-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-400">
            No doctors found
          </p>
          <p className="text-xs text-gray-600 mt-1 max-w-xs">
            Try adjusting your search filters or searching by a different name.
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-500 hover:text-blue-400 transition-colors underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        <span className="font-semibold text-gray-300">{total}</span> doctor
        {total !== 1 ? "s" : ""} found
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {doctors.map((doc) => (
          <DoctorCard key={doc.id} doctor={doc} />
        ))}
      </div>
    </div>
  );
};

export default FindDoctorsResultsGrid;
