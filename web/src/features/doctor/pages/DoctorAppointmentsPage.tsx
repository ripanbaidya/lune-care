import React, { useState } from "react";
import TodayTab from "../components/appointments/TodayTab";
import HistoryTab from "../components/appointments/HistoryTab";

type MainTab = "today" | "history";

const DoctorAppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTab>("today");

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-white">Appointments</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage your patient appointments
        </p>
      </div>

      {/* Main tabs */}
      <div className="flex border border-white/10 rounded-lg overflow-hidden w-fit">
        {[
          { key: "today" as MainTab, label: "Today's" },
          { key: "history" as MainTab, label: "History" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "bg-teal-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "today" ? <TodayTab /> : <HistoryTab />}
    </div>
  );
};

export default DoctorAppointmentsPage;
