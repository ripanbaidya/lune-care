import React from "react";
import { CheckCircle2, Star } from "lucide-react";
import { SubmitFeedbackForm } from "../../../feedback/components/SubmitFeedbackForm";

interface FeedbackSectionProps {
  appointmentId: string;
  doctorId: string;
  feedbackSubmitted: boolean;
  showFeedbackForm: boolean;
  onShowFormChange: (show: boolean) => void;
  onFeedbackSubmit: () => void;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  appointmentId,
  doctorId,
  feedbackSubmitted,
  showFeedbackForm,
  onShowFormChange,
  onFeedbackSubmit,
}) => {
  if (feedbackSubmitted) {
    return (
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-green-900/40 to-emerald-900/30 border border-green-600/20 rounded-xl backdrop-blur-md">
        <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
        <p className="text-sm text-green-300/90">
          Feedback submitted — thank you for your review!
        </p>
      </div>
    );
  }

  return (
    <div>
      {!showFeedbackForm ? (
        <button
          onClick={() => onShowFormChange(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-900/40 to-orange-900/30 border border-amber-600/20 text-amber-300/90 text-sm font-semibold rounded-xl hover:from-amber-900/60 hover:to-orange-900/50 hover:border-amber-500/30 transition-all duration-200 backdrop-blur-md"
        >
          <Star size={15} />
          Leave Feedback for this Appointment
        </button>
      ) : (
        <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 rounded-2xl border border-white/10 p-6 backdrop-blur-xl">
          <SubmitFeedbackForm
            appointmentId={appointmentId}
            doctorId={doctorId}
            onSuccess={() => {
              onFeedbackSubmit();
              onShowFormChange(false);
            }}
            onCancel={() => onShowFormChange(false)}
          />
        </div>
      )}
    </div>
  );
};

export default FeedbackSection;
