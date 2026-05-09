import React from "react";
import { Star } from "lucide-react";
import { StarRating } from "./StarRating";
import clsx from "clsx";

interface DoctorRatingSummaryProps {
  averageRating: number;
  totalReviews: number;
  /**
   * compact: single-line chip (for doctor search cards)
   * full: block with score + bar breakdown (for a public profile hero)
   */
  variant?: "compact" | "full";
  className?: string;
}

/**
 * Displays the aggregated doctor rating.
 * variant="compact"  → used inside DoctorSearchCard / ClinicCard (small pill)
 * variant="full"     → used at the top of DoctorPublicProfilePage (prominent block)
 */
export const DoctorRatingSummary: React.FC<DoctorRatingSummaryProps> = ({
  averageRating,
  totalReviews,
  variant = "compact",
  className,
}) => {
  if (totalReviews === 0) {
    return (
      <div className={clsx("flex items-center gap-1.5 text-gray-500", className)}>
        <Star size={13} className="text-gray-600" fill="currentColor" />
        <span className="text-xs">No reviews yet</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={clsx("flex items-center gap-2", className)}>
        <Star size={13} className="text-amber-400" fill="currentColor" />
        <span className="text-xs font-semibold text-gray-200 tabular-nums">
          {averageRating.toFixed(1)}
        </span>
        <span className="text-xs text-gray-500">({totalReviews})</span>
      </div>
    );
  }

  // full variant — prominent block for profile page
  return (
    <div className={clsx("rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800/50 p-6", className)}>
      <div className="flex items-center gap-8">
        {/* Big score */}
        <div className="text-center">
          <p className="text-5xl font-bold text-white tabular-nums leading-none">
            {averageRating.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-2">out of 5</p>
        </div>

        {/* Stars + count */}
        <div className="flex-1">
          <StarRating value={averageRating} readOnly size="md" />
          <p className="text-xs text-gray-400 mt-2">
            {totalReviews.toLocaleString("en-IN")} review
            {totalReviews !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
};