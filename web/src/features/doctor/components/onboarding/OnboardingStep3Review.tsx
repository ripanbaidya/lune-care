import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import Spinner from "../../../../shared/components/ui/Spinner";

type Step3Status = "pending" | "approved" | "rejected";

interface OnboardingStep3ReviewProps {
  status: Step3Status;
  onGoToDashboard: () => void;
  onResubmit: () => void;
}

const OnboardingStep3Review: React.FC<OnboardingStep3ReviewProps> = ({
  status,
  onGoToDashboard,
  onResubmit,
}) => (
  <div className="bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 text-center">
    {/* ── APPROVED ── */}
    {status === "approved" && (
      <>
        <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-green-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">
          🎉 Application Approved!
        </h2>
        <p className="text-sm text-gray-400 mb-2">
          Welcome to LuneCare, Doctor. Your credentials have been verified by
          our admin team.
        </p>
        <p className="text-xs text-gray-500 mb-6">
          You're all set to start consultations and manage your patients.
        </p>
        <button
          onClick={onGoToDashboard}
          className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors duration-200"
        >
          Go to Dashboard →
        </button>
      </>
    )}

    {/* ── REJECTED ── */}
    {status === "rejected" && (
      <>
        <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={28} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">
          Application Rejected
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Our admin team reviewed your application and could not verify your
          credentials at this time.
        </p>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-left mb-6">
          <p className="text-xs font-semibold text-red-300 mb-2">
            Common reasons for rejection
          </p>
          <ul className="text-xs text-red-200/70 space-y-1.5">
            <li>• Uploaded document was unclear or expired</li>
            <li>• Mismatched information between form and documents</li>
            <li>• Incomplete qualification details</li>
          </ul>
        </div>
        <button
          onClick={onResubmit}
          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors duration-200"
        >
          Resubmit Application
        </button>
      </>
    )}

    {/* ── PENDING ── */}
    {status === "pending" && (
      <>
        <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={28} className="text-amber-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">
          Application Under Review
        </h2>
        <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
          Your onboarding details have been submitted. Our admin team will
          review your credentials and notify you once your account is activated.
        </p>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-left mb-5">
          <p className="text-xs font-semibold text-amber-300 mb-2">
            What happens next?
          </p>
          <ul className="text-xs text-amber-200/70 space-y-1.5">
            <li>• Admin reviews your submitted documents and credentials</li>
            <li>• You'll receive a notification on approval or rejection</li>
            <li>• Once approved, you can access all doctor features</li>
          </ul>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-4">
          <Spinner size="sm" />
          <span>Checking approval status automatically...</span>
        </div>
        <p className="text-xs text-gray-600">
          Typical review time: 24–48 hours
        </p>
      </>
    )}
  </div>
);

export default OnboardingStep3Review;