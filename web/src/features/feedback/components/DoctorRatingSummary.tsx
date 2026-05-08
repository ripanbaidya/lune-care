import React from 'react';
import {Star} from 'lucide-react';
import {StarRating} from './StarRating';
import clsx from 'clsx';

interface DoctorRatingSummaryProps {
    averageRating: number;
    totalReviews: number;
    /**
     * compact: single-line chip (for doctor search cards)
     * full: block with score + bar breakdown (for a public profile hero)
     */
    variant?: 'compact' | 'full';
    className?: string;
}

/**
 * Displays the aggregated doctor rating.
 *
 * variant="compact"  → used inside DoctorSearchCard / ClinicCard (small pill)
 * variant="full"     → used at the top of DoctorPublicProfilePage (prominent block)
 */
export const DoctorRatingSummary: React.FC<DoctorRatingSummaryProps> = ({
                                                                            averageRating,
                                                                            totalReviews,
                                                                            variant = 'compact',
                                                                            className,
                                                                        }) => {
    if (totalReviews === 0) {
        return (
            <div className={clsx('flex items-center gap-1 text-gray-400', className)}>
                <Star size={13} className="text-gray-300" fill="currentColor"/>
                <span className="text-xs">No reviews yet</span>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={clsx('flex items-center gap-1.5', className)}>
                <Star size={13} className="text-amber-400" fill="currentColor"/>
                <span className="text-xs font-semibold text-gray-700 tabular-nums">
                    {averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">({totalReviews})</span>
            </div>
        );
    }

    // full variant — prominent block for profile page
    return (
        <div className={clsx('flex items-center gap-5', className)}>
            {/* Big score */}
            <div className="text-center">
                <p className="text-4xl font-bold text-gray-900 tabular-nums leading-none">
                    {averageRating.toFixed(1)}
                </p>
                <p className="text-xs text-gray-400 mt-1">out of 5</p>
            </div>

            {/* Stars + count */}
            <div>
                <StarRating value={averageRating} readOnly size="md"/>
                <p className="text-xs text-gray-500 mt-1">
                    {totalReviews.toLocaleString('en-IN')} review{totalReviews !== 1 ? 's' : ''}
                </p>
            </div>
        </div>
    );
};