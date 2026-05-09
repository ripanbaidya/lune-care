import React from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight, Clock, IndianRupee } from "lucide-react";
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
} from "../../../doctor/types/doctor.appointment.types";
import type { AppointmentBookingResponse } from "../../../appointment/services/appointmentService";
import { appointmentDetailPath } from "../../../../routes/routePaths";

const AppointmentCard: React.FC<{ appt: AppointmentBookingResponse }> = ({
  appt,
}) => {
  const navigate = useNavigate();

  const statusClass =
    APPOINTMENT_STATUS_COLORS[
      appt.status as keyof typeof APPOINTMENT_STATUS_COLORS
    ] ?? "bg-gray-700/40 text-gray-300";
  const statusLabel =
    APPOINTMENT_STATUS_LABELS[
      appt.status as keyof typeof APPOINTMENT_STATUS_LABELS
    ] ?? appt.status;

  const fmtTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  };

  return (
    <button
      onClick={() => navigate(appointmentDetailPath(appt.id))}
      className="w-full text-left bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-blue-400/50 hover:bg-gradient-to-br hover:from-gray-900/50 hover:via-gray-900/30 hover:to-black/50 transition-all duration-300 group shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays
              size={15}
              className="text-blue-400/90 flex-shrink-0"
            />
            <span className="text-sm font-semibold text-gray-100">
              {appt.appointmentDate}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <Clock size={12} className="flex-shrink-0" />
            {fmtTime(appt.startTime)} – {fmtTime(appt.endTime)}
          </div>
          {appt.consultationFees != null && (
            <div className="flex items-center gap-0.5 text-xs text-teal-400/90 font-medium">
              <IndianRupee size={12} />
              {appt.consultationFees}
            </div>
          )}
          {appt.cancellationReason && (
            <p className="text-xs text-red-400/80 mt-2 truncate">
              Reason: {appt.cancellationReason}
            </p>
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm ${statusClass}`}
          >
            {statusLabel}
          </span>
          <ChevronRight
            size={16}
            className="text-gray-600 group-hover:text-blue-400/80 transition-colors duration-200"
          />
        </div>
      </div>
    </button>
  );
};

export default AppointmentCard;
