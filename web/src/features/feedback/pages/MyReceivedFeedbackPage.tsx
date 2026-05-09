import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { FeedbackCard } from "../components/FeedbackCard";
import { DoctorRatingSummary } from "../components/DoctorRatingSummary";
import Spinner from "../../../shared/components/ui/Spinner";
import { useDoctorFeedback, useMyReceivedFeedback } from "../hooks/useFeedback";
import { useDoctorProfile } from "../../doctor/hooks/useDoctorProfile";

/**
 * list of all feedback received by the authenticated doctor.
 * Shows the doctor's own average rating summary at the top, then paginated individual
 * reviews from patients.
 */
const MyReceivedFeedbackPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const { data: profileRes } = useDoctorProfile();
  const doctorId = profileRes?.data?.userId ?? "";

  const { data, isLoading } = useMyReceivedFeedback(page, 10);
  // Fetch aggregate summary using the doctor's userId
  const { data: summaryRes } = useDoctorFeedback(doctorId, 0, 1);

  const feedbacks = data?.data?.content ?? [];
  const pageInfo = data?.data?.page;
  const totalPages = pageInfo?.totalPages ?? 0;
  const totalElements = pageInfo?.totalElements ?? 0;
  const summary = summaryRes?.data;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">My Reviews</h1>
        <p className="text-sm text-gray-400 mt-1">
          Feedback received from your patients
        </p>
      </div>

      {/* Rating summary */}
      {summary && summary.totalReviews > 0 && (
        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 px-6 py-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Overall Rating
          </p>
          <DoctorRatingSummary
            averageRating={summary.averageRating}
            totalReviews={summary.totalReviews}
            variant="full"
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 flex flex-col items-center py-16 gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-800/30 flex items-center justify-center">
            <Star size={24} className="text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-300">No reviews yet</p>
          <p className="text-xs text-gray-500 text-center max-w-xs">
            Patient reviews will appear here after completed appointments.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 px-1">
            <span className="text-gray-300 font-semibold">{totalElements}</span>{" "}
            review{totalElements !== 1 ? "s" : ""}
          </p>
          <div className="space-y-4">
            {feedbacks.map((fb) => (
              <FeedbackCard
                key={fb.id}
                feedback={fb}
                editable={false}
                showPatientId={true}
              />
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-800/50">
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

export default MyReceivedFeedbackPage;
