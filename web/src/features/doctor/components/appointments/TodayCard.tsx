import React, { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  UserCircle,
  X,
  XCircle,
} from "lucide-react";
import Spinner from "../../../../shared/components/ui/Spinner";
import type { AppointmentResponse } from "../../types/doctor.appointment.types";
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
} from "../../types/doctor.appointment.types";
import { toast } from "sonner";

const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

const fmtDate = (d: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

interface TodayCardProps {
  appt: AppointmentResponse;
  onComplete: (id: string) => void;
  onNoShow: (id: string) => void;
  onCancel: (id: string, reason: string) => void;
  actingId: string | null;
}

const TodayCard: React.FC<TodayCardProps> = ({
  appt,
  onComplete,
  onNoShow,
  onCancel,
  actingId,
}) => {
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const isActing = actingId === appt.id;
  const statusClass =
    APPOINTMENT_STATUS_COLORS[
      appt.status as keyof typeof APPOINTMENT_STATUS_COLORS
    ] ?? "bg-gray-800 text-gray-400";
  const statusLabel =
    APPOINTMENT_STATUS_LABELS[
      appt.status as keyof typeof APPOINTMENT_STATUS_LABELS
    ] ?? appt.status;

  const canAct = appt.status === "CONFIRMED";

  const handleCancelSubmit = () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    onCancel(appt.id, cancelReason.trim());
    setShowCancelForm(false);
    setCancelReason("");
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
            <UserCircle size={20} className="text-teal-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Patient ID</p>
            <p className="text-sm font-medium text-white font-mono truncate max-w-[160px]">
              {appt.patientId}
            </p>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Time info */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <Clock size={11} className="text-gray-600" />
          {fmtTime(appt.startTime)} – {fmtTime(appt.endTime)}
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays size={11} className="text-gray-600" />
          {fmtDate(appt.slotDate)}
        </span>
      </div>

      {/* Cancellation reason */}
      {appt.status === "CANCELLED" && appt.cancellationReason && (
        <p className="text-xs text-red-400 mb-3 truncate">
          Reason: {appt.cancellationReason}
        </p>
      )}

      {/* Action buttons — CONFIRMED only */}
      {canAct && !showCancelForm && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <button
            onClick={() => onComplete(appt.id)}
            disabled={isActing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-medium rounded-lg hover:bg-green-600/30 disabled:opacity-50 transition-colors"
          >
            {isActing ? <Spinner size="sm" /> : <CheckCircle2 size={12} />}
            Mark Complete
          </button>
          <button
            onClick={() => onNoShow(appt.id)}
            disabled={isActing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500/10 border border-gray-500/20 text-gray-400 text-xs font-medium rounded-lg hover:bg-gray-500/20 disabled:opacity-50 transition-colors"
          >
            {isActing ? <Spinner size="sm" /> : <XCircle size={12} />}
            No Show
          </button>
          <button
            onClick={() => setShowCancelForm(true)}
            disabled={isActing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/20 disabled:opacity-50 transition-colors"
          >
            <X size={12} />
            Cancel
          </button>
        </div>
      )}

      {/* Inline cancel form */}
      {showCancelForm && (
        <div className="space-y-2 mt-2">
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation..."
            rows={2}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-teal-500/50 resize-none transition-all"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowCancelForm(false);
                setCancelReason("");
              }}
              className="flex items-center gap-1 px-3 py-1.5 border border-white/10 text-gray-400 text-xs rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={11} /> Discard
            </button>
            <button
              onClick={handleCancelSubmit}
              disabled={isActing}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {isActing ? <Spinner size="sm" /> : null}
              Confirm Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayCard;
