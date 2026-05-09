import React from "react";
import type { AppointmentResponse } from "../../types/doctor.appointment.types";

interface AppointmentSummaryStripProps {
  appointments: AppointmentResponse[];
}

const AppointmentSummaryStrip: React.FC<AppointmentSummaryStripProps> = ({
  appointments,
}) => {
  const stats = [
    { label: "Total", value: appointments.length, color: "text-white" },
    {
      label: "Confirmed",
      value: appointments.filter((a) => a.status === "CONFIRMED").length,
      color: "text-teal-400",
    },
    {
      label: "Completed",
      value: appointments.filter((a) => a.status === "COMPLETED").length,
      color: "text-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-2xl border border-white/10 px-4 py-3 text-center"
        >
          <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-gray-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

export default AppointmentSummaryStrip;
