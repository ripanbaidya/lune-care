import React, { useState } from "react";
import { usePatientAppointmentHistory } from "../hooks/usePatientAppointments";
import Spinner from "../../../shared/components/ui/Spinner";
import AppointmentCard from "../components/appointments/AppointmentCard";
import AppointmentTabs from "../components/appointments/AppointmentTabs";
import AppointmentEmpty from "../components/appointments/AppointmentEmpty";

type Tab = "upcoming" | "completed" | "cancelled";

const STATUS_MAP: Record<Tab, string[]> = {
  upcoming: ["CONFIRMED", "PENDING_PAYMENT"],
  completed: ["COMPLETED"],
  cancelled: ["CANCELLED", "NO_SHOW"],
};

const PatientAppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const { data, isLoading } = usePatientAppointmentHistory(0, 50);

  const all = data?.data?.content ?? [];
  const filtered = all.filter((a) => STATUS_MAP[activeTab].includes(a.status));

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">My Appointments</h1>
        <p className="text-sm text-gray-400 mt-1">
          View and manage your appointment history
        </p>
      </div>

      {/* Tabs */}
      <AppointmentTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        allAppointments={all}
      />

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <AppointmentEmpty activeTab={activeTab} />
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <AppointmentCard key={appt.id} appt={appt} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientAppointmentsPage;
