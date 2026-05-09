import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import Spinner from "../../../shared/components/ui/Spinner";

interface Props {
  doctorName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}

const RejectModal: React.FC<Props> = ({
  doctorName,
  onConfirm,
  onCancel,
  isPending,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Rejection reason is required.");
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-800/60 bg-gradient-to-b from-gray-900 to-black shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Reject Verification
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Dr. {doctorName}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-gray-600 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-400">
            Provide a clear reason. The doctor will see this and must resubmit.
          </p>
          <div>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
              rows={3}
              maxLength={300}
              placeholder="e.g. Incomplete medical license documentation..."
              className="w-full px-4 py-3 bg-gray-950/60 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 resize-none transition-all"
            />
            <div className="flex items-center justify-between mt-1">
              {error ? (
                <p className="text-xs text-red-400">{error}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-gray-600 ml-auto">
                {reason.length}/300
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-700 text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-colors"
          >
            {isPending ? <Spinner size="sm" /> : null}
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
