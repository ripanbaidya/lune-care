import React, {useState} from 'react';
import {MessageSquare, Send, X} from 'lucide-react';
import {StarRating} from './StarRating';
import {FormError} from '../../../shared/components/ui/FormError';
import Spinner from '../../../shared/components/ui/Spinner';
import {useSubmitFeedback} from '../hooks/useFeedback';
import {AppError} from '../../../shared/utils/errorParser';
import {toast} from 'sonner';

interface SubmitFeedbackFormProps {
    appointmentId: string;
    doctorId: string;
    /** Called after successful submission so the parent can update its UI state */
    onSuccess?: () => void;
    /** Allow parent to dismiss / collapse the form */
    onCancel?: () => void;
}

/**
 * Inline form for submitting feedback after a COMPLETED appointment.
 * Plug this into the AppointmentDetailPage when status === 'COMPLETED' and
 * no feedback has been submitted yet.
 */
export const SubmitFeedbackForm: React.FC<SubmitFeedbackFormProps> = ({
                                                                          appointmentId,
                                                                          doctorId,
                                                                          onSuccess,
                                                                          onCancel,
                                                                      }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    const {mutate: submitFeedback, isPending} = useSubmitFeedback(doctorId);

    const handleSubmit = () => {
        setFormError(null);

        if (rating === 0) {
            setFormError('Please select a rating before submitting.');
            return;
        }

        submitFeedback(
            {
                appointmentId,
                rating,
                comment: comment.trim() || undefined,
            },
            {
                onSuccess: () => {
                    toast.success('Feedback submitted — thank you!');
                    onSuccess?.();
                },
                onError: (err: AppError) => {
                    // FEEDBACK_ALREADY_EXISTS — edge case if they double-submit
                    if (err.isConflict) {
                        toast.info('You have already submitted feedback for this appointment.');
                        onSuccess?.(); // treat as success to dismiss form
                    } else {
                        setFormError(err.message);
                    }
                },
            },
        );
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-blue-600"/>
                    <p className="text-sm font-semibold text-gray-800">Leave Feedback</p>
                </div>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    >
                        <X size={16}/>
                    </button>
                )}
            </div>

            <FormError error={formError}/>

            {/* Rating */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                    Rate your experience <span className="text-red-400">*</span>
                </label>
                <StarRating
                    value={rating}
                    onChange={setRating}
                    size="lg"
                    showValue={rating > 0}
                />
            </div>

            {/* Comment */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Review <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Share your experience with the doctor..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-0.5">{comment.length}/500</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={isPending || rating === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                    {isPending ? <Spinner size="sm"/> : <Send size={14}/>}
                    Submit Feedback
                </button>
            </div>
        </div>
    );
};