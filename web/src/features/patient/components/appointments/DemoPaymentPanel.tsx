import React from "react";
import { CheckCircle2, PlayCircle, Sparkles, XCircle } from "lucide-react";
import Spinner from "../../../../shared/components/ui/Spinner";

interface DemoPaymentPanelProps {
  appointmentId: string;
  amount: number;
  sessionId: string;
  isProcessing: boolean;
  onSuccess: () => void;
  onFailure: () => void;
  onBackToLive: () => void;
}

const DemoPaymentPanel: React.FC<DemoPaymentPanelProps> = ({
  appointmentId,
  amount,
  sessionId,
  isProcessing,
  onSuccess,
  onFailure,
  onBackToLive,
}) => {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-blue-200">
              Demo payment is active
            </p>
            <p className="text-xs text-blue-100/80 mt-1 leading-relaxed">
              This path bypasses external gateways and is meant for demos only.
              You can simulate both a success and a failure state.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-gray-900/40 px-4 py-3 space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-gray-400">Appointment</span>
          <span className="font-mono text-gray-200 truncate">{appointmentId}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-gray-400">Demo session</span>
          <span className="font-mono text-gray-200 truncate">{sessionId}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-gray-400">Amount</span>
          <span className="font-semibold text-gray-100">₹{amount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onFailure}
          disabled={isProcessing}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-300 bg-red-500/10 hover:bg-red-500/15 disabled:opacity-60 transition-colors"
        >
          {isProcessing ? <Spinner size="sm" /> : <XCircle size={14} />}
          Simulate Failure
        </button>
        <button
          onClick={onSuccess}
          disabled={isProcessing}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold hover:from-emerald-500 hover:to-green-500 disabled:opacity-60 transition-colors"
        >
          {isProcessing ? <Spinner size="sm" /> : <CheckCircle2 size={14} />}
          Simulate Success
        </button>
      </div>

      <button
        onClick={onBackToLive}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-300 border border-gray-700/70 rounded-xl hover:bg-gray-800/50 transition-colors disabled:opacity-60"
      >
        <PlayCircle size={14} />
        Back to live gateways
      </button>
    </div>
  );
};

export default DemoPaymentPanel;
