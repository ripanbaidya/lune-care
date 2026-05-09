import React, { useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { StarRating } from "./StarRating";
import { FormError } from "../../../shared/components/ui/FormError";
import Spinner from "../../../shared/components/ui/Spinner";
import { useSubmitFeedback } from "../hooks/useFeedback";
import { AppError } from "../../../shared/utils/errorParser";
import { toast } from "sonner";

interface SubmitFeedbackFormProps {
  appointmentId: string;
  doctorId: string;
  /** Called after successful submission so the parent can update its UI state */
  onSuccess?: () => void;
  /** Allow parent to dismiss / collapse the form */
  onCancel?: () => void;
}

/**
 * Inline form for submitting feedback after an COMPLETED appointment.
 */
export const SubmitFeedbackForm: React.FC<SubmitFeedbackFormProps> = ({
  appointmentId,
  doctorId,
  onSuccess,
  onCancel,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { mutate: submitFeedback, isPending } = useSubmitFeedback(doctorId);

  const handleSubmit = () => {
    setFormError(null);

    if (rating === 0) {
      setFormError("Please select a rating before submitting.");
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
          toast.success("Feedback submitted — thank you!");
          onSuccess?.();
        },
        onError: (err: AppError) => {
          // FEEDBACK_ALREADY_EXISTS — edge case if they double-submit
          if (err.isConflict) {
            toast.info(
              "You have already submitted feedback for this appointment.",
            );
            onSuccess?.(); // treat as success to dismiss form
          } else {
            setFormError(err.message);
          }
        },
      },
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
            <MessageSquare size={16} className="text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-white">Leave Feedback</p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 text-gray-600 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <FormError error={formError} />

      {/* Rating */}
      <div>
        <label className="block text-xs font-semibold text-gray-300 mb-3">
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
        <label className="block text-xs font-semibold text-gray-300 mb-2">
          Review <span className="text-gray-500">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Share your experience with the doctor..."
          className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none"
        />
        <p className="text-xs text-gray-500 text-right mt-2">
          {comment.length}/500
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2.5 border border-gray-700/50 text-sm text-gray-300 rounded-lg hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isPending || rating === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold rounded-lg disabled:opacity-60 shadow-lg shadow-blue-600/20 transition-all duration-200"
        >
          {isPending ? <Spinner size="sm" /> : <Send size={14} />}
          Submit Feedback
        </button>
      </div>
    </div>
  );
};
