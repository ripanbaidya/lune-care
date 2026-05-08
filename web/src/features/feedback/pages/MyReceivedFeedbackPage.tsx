import React, {useState} from 'react';
import {ChevronLeft, ChevronRight, Star} from 'lucide-react';
import {FeedbackCard} from '../components/FeedbackCard';
import {DoctorRatingSummary} from '../components/DoctorRatingSummary';
import Spinner from '../../../shared/components/ui/Spinner';
import {useDoctorFeedback, useMyReceivedFeedback} from '../hooks/useFeedback';
import {useDoctorProfile} from '../../doctor/hooks/useDoctorProfile';

/**
 * Full page: list of all feedback received by the authenticated doctor.
 * Route: /doctor/feedback  (add this to ROUTES and AppRoutes)
 * Sidebar: add a "Feedback" nav item in DoctorSidebar.
 *
 * Shows the doctor's own average rating summary at the top,
 * then paginated individual reviews from patients.
 */
const MyReceivedFeedbackPage: React.FC = () => {
    const [page, setPage] = useState(0);
    const {data: profileRes} = useDoctorProfile();
    const doctorId = profileRes?.data?.userId ?? '';

    const {data, isLoading} = useMyReceivedFeedback(page, 10);
    // Fetch aggregate summary using the doctor's userId
    const {data: summaryRes} = useDoctorFeedback(doctorId, 0, 1);

    const feedbacks = data?.data?.content ?? [];
    const pageInfo = data?.data?.page;
    const totalPages = pageInfo?.totalPages ?? 0;
    const totalElements = pageInfo?.totalElements ?? 0;
    const summary = summaryRes?.data;

    return (
        <div className="space-y-5 pb-8">
            <div>
                <h1 className="text-xl font-bold text-gray-900">My Reviews</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    Feedback received from your patients
                </p>
            </div>

            {/* Rating summary */}
            {summary && summary.totalReviews > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
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
                <div className="flex items-center justify-center py-16">
                    <Spinner size="lg"/>
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                        <Star size={24} className="text-gray-300"/>
                    </div>
                    <p className="text-sm font-medium text-gray-600">No reviews yet</p>
                    <p className="text-xs text-gray-400 text-center max-w-xs">
                        Patient reviews will appear here after completed appointments.
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-xs text-gray-400">
                        {totalElements} review{totalElements !== 1 ? 's' : ''}
                    </p>
                    <div className="space-y-3">
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

            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-gray-400">Page {page + 1} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14}/> Prev
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight size={14}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyReceivedFeedbackPage;