import React from "react";
import { Award, Clock, Languages, UserCircle } from "lucide-react";
import { SPECIALIZATION_LABELS } from "../../types/doctor.types";
import type { DoctorSearchResult } from "../../hooks/useDoctorSearch";
import { DoctorRatingSummary } from "../../../feedback/components/DoctorRatingSummary";

interface DoctorInfoCardProps {
  doctor: DoctorSearchResult;
  ratingSummary?: { averageRating: number; totalReviews: number } | null;
}

const DoctorInfoCard: React.FC<DoctorInfoCardProps> = ({
  doctor,
  ratingSummary,
}) => (
  <div className="bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-5">
    <div className="flex items-start gap-4">
      {doctor.profilePhotoUrl ? (
        <img
          src={doctor.profilePhotoUrl}
          alt={doctor.firstName}
          className="w-16 h-16 rounded-full object-cover border-2 border-white/10 flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
          <UserCircle size={32} className="text-blue-400" />
        </div>
      )}
      <div className="min-w-0">
        <h1 className="text-base font-bold text-white">
          Dr. {doctor.firstName} {doctor.lastName}
        </h1>
        {doctor.specialization && (
          <p className="text-sm text-blue-400 font-medium">
            {SPECIALIZATION_LABELS[
              doctor.specialization as keyof typeof SPECIALIZATION_LABELS
            ] ?? doctor.specialization}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {doctor.qualification && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Award size={11} className="text-gray-500" />
              {doctor.qualification}
            </span>
          )}
          {doctor.yearsOfExperience != null && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={11} className="text-gray-500" />
              {doctor.yearsOfExperience} yrs exp
            </span>
          )}
        </div>
      </div>
    </div>

    {doctor.languagesSpoken?.length > 0 && (
      <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
        <Languages size={12} className="text-gray-500" />
        {doctor.languagesSpoken.join(", ")}
      </div>
    )}

    {ratingSummary && ratingSummary.totalReviews > 0 && (
      <div className="mt-2">
        <DoctorRatingSummary
          averageRating={ratingSummary.averageRating}
          totalReviews={ratingSummary.totalReviews}
          variant="compact"
        />
      </div>
    )}

    {doctor.bio && (
      <p className="mt-3 text-xs text-gray-500 leading-relaxed border-t border-white/5 pt-3">
        {doctor.bio}
      </p>
    )}
  </div>
);

export default DoctorInfoCard;
