import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Stethoscope } from "lucide-react";
import Spinner from "../../../../shared/components/ui/Spinner";
import { ROUTES } from "../../../../routes/routePaths";

interface AppointmentNotFoundProps {
  isLoading: boolean;
}

const AppointmentNotFound: React.FC<AppointmentNotFoundProps> = ({
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-20 gap-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-900/40 to-black/40 flex items-center justify-center border border-white/10 backdrop-blur-md">
        <Stethoscope size={32} className="text-gray-400/50" />
      </div>
      <p className="text-gray-400/80 text-sm font-medium">
        Appointment not found.
      </p>
      <Link
        to={ROUTES.patientAppointments}
        className="inline-flex items-center gap-2 text-blue-400/90 hover:text-blue-300 text-sm font-medium transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Appointments
      </Link>
    </div>
  );
};

export default AppointmentNotFound;
