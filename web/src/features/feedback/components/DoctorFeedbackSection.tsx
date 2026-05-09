import React, { useState } from "react";
import { MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { DoctorRatingSummary } from "./DoctorRatingSummary";
import { FeedbackCard } from "./FeedbackCard";
import Spinner from "../../../shared/components/ui/Spinner";
import { useDoctorFeedback } from "../hooks/useFeedback";

interface DoctorFeedbackSectionProps {
  doctorId: string;
  pageSize?: number;
}

/**
 * Full feedback section for the doctor's public profile.
 * It Shows - Aggregate rating summary (DoctorRatingSummary variant="full"),
 * Paginated individual reviews (FeedbackCard read-only)
 */
export const DoctorFeedbackSection: React.FC<DoctorFeedbackSectionProps> = ({
  doctorId,
  pageSize = 10,
}) => {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useDoctorFeedback(doctorId, page, pageSize);

  const summary = data?.data;
  const reviews = summary?.content ?? [];
  const pageInfo = summary?.page;
  const totalPages = pageInfo?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
          <MessageSquare size={18} className="text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Patient Reviews</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Feedback from verified patients
          </p>
        </div>
      </div>

      {/* Rating summary */}
      {summary && (
        <DoctorRatingSummary
          averageRating={summary.averageRating}
          totalReviews={summary.totalReviews}
          variant="full"
        />
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="md" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 flex flex-col items-center py-12 gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-800/30 flex items-center justify-center">
            <MessageSquare size={24} className="text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-300">No reviews yet</p>
          <p className="text-xs text-gray-500 text-center max-w-xs">
            Be the first to leave feedback after your appointment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((fb) => (
            <FeedbackCard key={fb.id} feedback={fb} editable={false} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
          <p className="text-xs text-gray-500">
            Page <span className="text-gray-300 font-medium">{page + 1}</span>{" "}
            of <span className="text-gray-300 font-medium">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-900/50 border border-gray-700/50 text-sm text-gray-300 rounded-lg hover:bg-gray-800/50 hover:border-gray-600/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-900/50 border border-gray-700/50 text-sm text-gray-300 rounded-lg hover:bg-gray-800/50 hover:border-gray-600/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
