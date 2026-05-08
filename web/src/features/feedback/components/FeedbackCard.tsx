import React, {useState} from 'react';
import {Pencil, Trash2, MoreVertical, X, Check} from 'lucide-react';
import {StarRating} from './StarRating';
import Spinner from '../../../shared/components/ui/Spinner';
import {FormError} from '../../../shared/components/ui/FormError';
import {useUpdateFeedback, useDeleteFeedback} from '../hooks/useFeedback';
import {AppError} from '../../../shared/utils/errorParser';
import {toast} from 'sonner';
import type {FeedbackResponse} from '../types/feedback.types';

interface FeedbackCardProps {
    feedback: FeedbackResponse;
    /**
     * Show edit/delete controls.
     * Should be true only when the current user is the feedback owner (patient view).
     */
    editable?: boolean;
    /** Show patient ID label (used in doctor's "received feedback" view) */
    showPatientId?: boolean;
}

/**
 * Single feedback row.
 * - Renders rating + comment + relative timestamp.
 * - When editable=true: shows edit and delete actions.
 * - Inline editing without a modal.
 */
export const FeedbackCard: React.FC<FeedbackCardProps> = ({
                                                              feedback,
                                                              editable = false,
                                                              showPatientId = false,
                                                          }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editRating, setEditRating] = useState(feedback.rating);
    const [editComment, setEditComment] = useState(feedback.comment ?? '');
    const [formError, setFormError] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const {mutate: updateFeedback, isPending: isUpdating} = useUpdateFeedback();
    const {mutate: deleteFeedback, isPending: isDeleting} = useDeleteFeedback();

    const fmtDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'});
    };

    const handleSave = () => {
        setFormError(null);
        if (editRating === 0) {
            setFormError('Rating is required.');
            return;
        }
        updateFeedback(
            {
                feedbackId: feedback.id,
                data: {rating: editRating, comment: editComment.trim() || undefined},
            },
            {
                onSuccess: () => {
                    toast.success('Feedback updated');
                    setIsEditing(false);
                },
                onError: (err: AppError) => setFormError(err.message),
            },
        );
    };

    const handleDelete = () => {
        if (!window.confirm('Delete this feedback? The appointment will become eligible for re-submission.')) return;
        deleteFeedback(feedback.id, {
            onSuccess: () => toast.success('Feedback deleted'),
            onError: (err: AppError) => toast.error(err.message),
        });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <StarRating value={isEditing ? editRating : feedback.rating}
                                onChange={isEditing ? setEditRating : undefined} readOnly={!isEditing} size="sm"
                                showValue/>
                    {showPatientId && (
                        <p className="text-xs text-gray-400 font-mono truncate max-w-[160px]">
                            Patient: {feedback.patientId}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{fmtDate(feedback.createdAt)}</span>

                    {editable && !isEditing && (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen((v) => !v)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <MoreVertical size={14}/>
                            </button>
                            {menuOpen && (
                                <div
                                    className="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[120px]"
                                    onMouseLeave={() => setMenuOpen(false)}
                                >
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setMenuOpen(false);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <Pencil size={13}/> Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleDelete();
                                            setMenuOpen(false);
                                        }}
                                        disabled={isDeleting}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        {isDeleting ? <Spinner size="sm"/> : <Trash2 size={13}/>}
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            {isEditing ? (
                <div className="mt-3 space-y-3">
                    <FormError error={formError}/>
                    <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="Update your review..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setFormError(null);
                                setEditRating(feedback.rating);
                                setEditComment(feedback.comment ?? '');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-xs rounded-lg hover:bg-gray-50"
                        >
                            <X size={12}/> Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                        >
                            {isUpdating ? <Spinner size="sm"/> : <Check size={12}/>}
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                feedback.comment && (
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{feedback.comment}</p>
                )
            )}
        </div>
    );
};