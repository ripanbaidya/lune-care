import React from "react";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

type StatusKey =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

interface StatusConfig {
  bg: string;
  text: string;
  sub: string;
  icon: React.ReactNode;
  label: string;
  subtitle: string;
}

interface AppointmentStatusBannerProps {
  status: StatusKey;
  cancellationReason?: string | null;
  appointmentDate?: string;
}

const STATUS_CONFIG: Record<StatusKey, StatusConfig> = {
  PENDING_PAYMENT: {
    bg: "bg-gradient-to-r from-amber-900/40 to-orange-900/30 border-amber-600/20",
    text: "text-amber-300",
    sub: "text-amber-300/80",
    icon: <AlertCircle size={20} className="text-amber-400 flex-shrink-0" />,
    label: "Pending Payment",
    subtitle: "Complete payment to confirm your appointment slot.",
  },
  CONFIRMED: {
    bg: "bg-gradient-to-r from-blue-900/40 to-cyan-900/30 border-blue-600/20",
    text: "text-blue-300",
    sub: "text-blue-300/80",
    icon: <CheckCircle2 size={20} className="text-blue-400 flex-shrink-0" />,
    label: "Confirmed",
    subtitle: "Your appointment is confirmed.",
  },
  COMPLETED: {
    bg: "bg-gradient-to-r from-green-900/40 to-emerald-900/30 border-green-600/20",
    text: "text-green-300",
    sub: "text-green-300/80",
    icon: <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />,
    label: "Completed",
    subtitle: "This appointment has been completed.",
  },
  CANCELLED: {
    bg: "bg-gradient-to-r from-red-900/40 to-pink-900/30 border-red-600/20",
    text: "text-red-300",
    sub: "text-red-300/80",
    icon: <XCircle size={20} className="text-red-400 flex-shrink-0" />,
    label: "Cancelled",
    subtitle: "This appointment was cancelled.",
  },
  NO_SHOW: {
    bg: "bg-gradient-to-r from-gray-800/40 to-slate-900/30 border-gray-600/20",
    text: "text-gray-300",
    sub: "text-gray-400/80",
    icon: <XCircle size={20} className="text-gray-400 flex-shrink-0" />,
    label: "No Show",
    subtitle: "Patient did not attend the appointment.",
  },
};

const formatDate = (d: string) => {
  if (!d) return "Date is not provided";
  const date = new Date(d);
  if (isNaN(date.getTime())) {
    console.log("Invalid date string received!", d);
    return "Invalid date format";
  }
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const AppointmentStatusBanner: React.FC<AppointmentStatusBannerProps> = ({
  status,
  cancellationReason,
  appointmentDate,
}) => {
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.CANCELLED;

  return (
    <div
      className={`rounded-2xl px-5 py-5 flex items-start gap-4 border backdrop-blur-md ${statusCfg.bg}`}
    >
      {statusCfg.icon}
      <div className="flex-1">
        <p className={`text-sm font-bold ${statusCfg.text}`}>
          {statusCfg.label}
        </p>
        <p className={`text-xs mt-1 leading-relaxed ${statusCfg.sub}`}>
          {status === "CONFIRMED" && appointmentDate
            ? `Confirmed for ${formatDate(appointmentDate)}.`
            : status === "CANCELLED" && cancellationReason
              ? `Reason: ${cancellationReason}`
              : statusCfg.subtitle}
        </p>
      </div>
    </div>
  );
};

export default AppointmentStatusBanner;