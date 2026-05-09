import React from "react";
import type { AppointmentBookingResponse } from "../../../appointment/services/appointmentService";

type Tab = "upcoming" | "completed" | "cancelled";

const STATUS_MAP: Record<Tab, string[]> = {
  upcoming: ["CONFIRMED", "PENDING_PAYMENT"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED", "NO_SHOW"],
};

interface AppointmentTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  allAppointments: AppointmentBookingResponse[];
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({
  activeTab,
  onTabChange,
  allAppointments,
}) => {
  const TABS: { key: Tab; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const upcomingCount = allAppointments.filter((a) =>
    STATUS_MAP.upcoming.includes(a.status),
  ).length;

  return (
    <div className="flex gap-0 bg-gradient-to-br from-gray-900/30 via-gray-900/20 to-black/30 backdrop-blur-lg rounded-xl border border-white/10 p-1 shadow-md">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          className={`flex-1 py-3 px-3 text-sm font-semibold transition-all duration-300 rounded-lg flex items-center justify-center gap-2 ${
            activeTab === t.key
              ? "bg-gradient-to-r from-blue-600/90 to-blue-700/90 text-white shadow-lg border border-blue-400/30"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
          }`}
        >
          {t.label}
          {t.key === "upcoming" && upcomingCount > 0 && (
            <span className="ml-1 text-xs bg-white/20 px-2 py-1 rounded-full font-medium backdrop-blur-sm">
              {upcomingCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default AppointmentTabs;
