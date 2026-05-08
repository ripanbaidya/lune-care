import React, {useState} from 'react';
import {MessageSquare, ChevronLeft, ChevronRight} from 'lucide-react';
import {DoctorRatingSummary} from './DoctorRatingSummary';
import {FeedbackCard} from './FeedbackCard';
import Spinner from '../../../shared/components/ui/Spinner';
import {useDoctorFeedback} from '../hooks/useFeedback';

interface DoctorFeedbackSectionProps {
    doctorId: string;
    /** Page size for the reviews list */
    pageSize?: number;
}

/**
 * Full feedback section for the doctor's public profile.
 * Shows:
 *  - Aggregate rating summary (DoctorRatingSummary variant="full")
 *  - Paginated individual reviews (FeedbackCard read-only)
 *
 * Plug this at the bottom of DoctorPublicProfilePage.
 */
export const DoctorFeedbackSection: React.FC<DoctorFeedbackSectionProps> = ({
                                                                                doctorId,
                                                                                pageSize = 10,
                                                                            }) => {
    const [page, setPage] = useState(0);
    const {data, isLoading} = useDoctorFeedback(doctorId, page, pageSize);

    const summary = data?.data;
    const reviews = summary?.content ?? [];
    const pageInfo = summary?.page;
    const totalPages = pageInfo?.totalPages ?? 0;

    return (
        <div className="space-y-5">
            {/* Section header */}
            <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-600"/>
                <h3 className="text-base font-semibold text-gray-900">Patient Reviews</h3>
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
                <div className="flex items-center justify-center py-10">
                    <Spinner size="md"/>
                </div>
            ) : reviews.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center py-10 gap-2">
                    <MessageSquare size={28} className="text-gray-200"/>
                    <p className="text-sm text-gray-400">No reviews yet</p>
                    <p className="text-xs text-gray-300">Be the first to leave feedback after your appointment.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map((fb) => (
                        <FeedbackCard key={fb.id} feedback={fb} editable={false}/>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-gray-400">
                        Page {page + 1} of {totalPages}
                    </p>
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