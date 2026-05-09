import React from "react";
import { XCircle } from "lucide-react";
import Spinner from "../../../../shared/components/ui/Spinner";

interface CancelAppointmentButtonProps {
  isCancelling: boolean;
  onCancel: () => void;
}

const CancelAppointmentButton: React.FC<CancelAppointmentButtonProps> = ({
  isCancelling,
  onCancel,
}) => {
  return (
    <button
      onClick={onCancel}
      disabled={isCancelling}
      className="flex items-center gap-2 px-5 py-3 border border-red-600/20 text-red-400/90 text-sm font-semibold rounded-xl hover:bg-red-900/20 hover:border-red-500/40 disabled:opacity-50 transition-all duration-200 backdrop-blur-md"
    >
      {isCancelling ? (
        <>
          <Spinner size="sm" className="animate-spin" />
          Cancelling...
        </>
      ) : (
        <>
          <XCircle size={15} />
          Cancel Appointment
        </>
      )}
    </button>
  );
};

export default CancelAppointmentButton;
