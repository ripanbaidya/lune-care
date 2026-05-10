import React, { useState } from "react";
import { Pencil, Trash2, MoreVertical, X, Check } from "lucide-react";
import { StarRating } from "./StarRating";
import Spinner from "../../../shared/components/ui/Spinner";
import { FormError } from "../../../shared/components/ui/FormError";
import { useUpdateFeedback, useDeleteFeedback } from "../hooks/useFeedback";
import { AppError } from "../../../shared/utils/errorParser";
import { toast } from "sonner";
import type { FeedbackResponse } from "../types/feedback.types";

interface FeedbackCardProps {
  feedback: FeedbackResponse;
  /**
   * Show edit/delete controls.
   * Should be true only when the current user is the feedback owner (patient view).
   */
  editable?: boolean;
  /**
   * Show patient ID label (used in doctor's "received feedback" view)
   */
  showPatientId?: boolean;
}

/**
 * Single feedback row.
 * Renders rating + comment + relative timestamp.
 * When editable=true: shows edit and delete actions.
 * Inline editing without a modal.
 */
export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  editable = false,
  showPatientId = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(feedback.rating);
  const [editComment, setEditComment] = useState(feedback.comment ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const { mutate: updateFeedback, isPending: isUpdating } = useUpdateFeedback();
  const { mutate: deleteFeedback, isPending: isDeleting } = useDeleteFeedback();

  const fmtDate = (iso: any) => {
    if (!iso) return "No date";

    let d: Date;
    if (Array.isArray(iso)) {
      // Handle Jackson array format: [year, month, day, hour, minute, second]
      const [year, month, day, hour = 0, minute = 0, second = 0] = iso;
      d = new Date(year, month - 1, day, hour, minute, second);
    } else if (typeof iso === "number" || (!isNaN(Number(iso)) && String(iso).trim() !== "")) {
      // Handle epoch timestamp (if seconds, multiply by 1000)
      const num = Number(iso);
      d = new Date(num > 9999999999 ? num : num * 1000);
    } else {
      d = new Date(iso);
    }

    if (isNaN(d.getTime())) return "Invalid date";

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSave = () => {
    setFormError(null);
    if (editRating === 0) {
      setFormError("Rating is required.");
      return;
    }
    updateFeedback(
      {
        feedbackId: feedback.id,
        data: { rating: editRating, comment: editComment.trim() || undefined },
      },
      {
        onSuccess: () => {
          toast.success("Feedback updated");
          setIsEditing(false);
        },
        onError: (err: AppError) => setFormError(err.message),
      },
    );
  };

  const handleDelete = () => {
    if (
      !window.confirm(
        "Delete this feedback? The appointment will become eligible for re-submission.",
      )
    )
      return;
    deleteFeedback(feedback.id, {
      onSuccess: () => toast.success("Feedback deleted"),
      onError: (err: AppError) => toast.error(err.message),
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-xl border border-gray-800/50 px-5 py-4 hover:border-gray-700/50 transition-all duration-200">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <StarRating
            value={isEditing ? editRating : feedback.rating}
            onChange={isEditing ? setEditRating : undefined}
            readOnly={!isEditing}
            size="sm"
            showValue
          />
          {showPatientId && (
            <p className="text-xs text-gray-500 font-mono truncate max-w-[160px]">
              Patient: {feedback.patientId}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-gray-500">
            {fmtDate(feedback.createdAt)}
          </span>

          {editable && !isEditing && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1.5 text-gray-600 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              >
                <MoreVertical size={14} />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-8 z-20 bg-gray-900/95 backdrop-blur-sm border border-gray-800/50 rounded-xl shadow-2xl py-1 min-w-[130px]"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setMenuOpen(false);
                    }}
                    disabled={isDeleting}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
                  >
                    {isDeleting ? <Spinner size="sm" /> : <Trash2 size={13} />}
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
        <div className="mt-4 space-y-3">
          <FormError error={formError} />
          <textarea
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Update your review..."
            className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormError(null);
                setEditRating(feedback.rating);
                setEditComment(feedback.comment ?? "");
              }}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-700/50 text-xs text-gray-300 rounded-lg hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200"
            >
              <X size={12} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium rounded-lg hover:from-blue-500 hover:to-blue-600 disabled:opacity-60 shadow-lg shadow-blue-600/20 transition-all duration-200"
            >
              {isUpdating ? <Spinner size="sm" /> : <Check size={12} />}
              Save
            </button>
          </div>
        </div>
      ) : (
        feedback.comment && (
          <p className="mt-3 text-sm text-gray-300 leading-relaxed">
            {feedback.comment}
          </p>
        )
      )}
    </div>
  );
};
