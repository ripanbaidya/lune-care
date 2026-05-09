import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { ROUTES } from "../../../../routes/routePaths";

interface AppointmentEmptyProps {
  activeTab: "upcoming" | "completed" | "cancelled";
}

const AppointmentEmpty: React.FC<AppointmentEmptyProps> = ({ activeTab }) => (
  <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col items-center py-16 gap-4 shadow-md">
    <div className="bg-gradient-to-br from-gray-800/40 to-black/40 rounded-full p-4 backdrop-blur-md border border-white/10">
      <CalendarDays size={36} className="text-gray-500/70" />
    </div>
    <p className="text-sm text-gray-400 font-medium">
      No {activeTab} appointments
    </p>
    {activeTab === "upcoming" && (
      <Link
        to={ROUTES.findDoctors}
        className="text-sm text-blue-400/90 font-semibold hover:text-blue-300 transition-colors duration-200 mt-2"
      >
        Find a Doctor →
      </Link>
    )}
  </div>
);

export default AppointmentEmpty;
