import React, { useState } from "react";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import Spinner from "../../../../shared/components/ui/Spinner";
import { AppError } from "../../../../shared/utils/errorParser";
import {
  useCancelAppointment,
  useDoctorTodayAppointments,
  useMarkAppointmentComplete,
  useMarkNoShow,
} from "../../hooks/useDoctorAppointments";
import TodayCard from "./TodayCard";
import AppointmentSummaryStrip from "./AppointmentSummaryStrip";

const TodayTab: React.FC = () => {
  const { data, isLoading } = useDoctorTodayAppointments();
  const { mutate: markComplete, isPending: isCompleting } =
    useMarkAppointmentComplete();
  const { mutate: markNoShow, isPending: isNoShow } = useMarkNoShow();
  const { mutate: cancelAppt, isPending: isCancelling } =
    useCancelAppointment();

  const [actingId, setActingId] = useState<string | null>(null);

  const appointments = data?.data ?? [];
  const isPending = isCompleting || isNoShow || isCancelling;

  const handleComplete = (id: string) => {
    setActingId(id);
    markComplete(id, {
      onSuccess: () => {
        toast.success("Appointment marked as completed");
        setActingId(null);
      },
      onError: (err: AppError) => {
        toast.error(err.message);
        setActingId(null);
      },
    });
  };

  const handleNoShow = (id: string) => {
    if (!window.confirm("Mark this appointment as no-show?")) return;
    setActingId(id);
    markNoShow(id, {
      onSuccess: () => {
        toast.success("Appointment marked as no-show");
        setActingId(null);
      },
      onError: (err: AppError) => {
        toast.error(err.message);
        setActingId(null);
      },
    });
  };

  const handleCancel = (id: string, reason: string) => {
    setActingId(id);
    cancelAppt(
      { appointmentId: id, reason },
      {
        onSuccess: () => {
          toast.success("Appointment cancelled");
          setActingId(null);
        },
        onError: (err: AppError) => {
          toast.error(err.message);
          setActingId(null);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col items-center py-14 gap-3">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <CalendarDays size={24} className="text-gray-600" />
        </div>
        <p className="text-sm text-gray-500">
          No appointments scheduled for today
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AppointmentSummaryStrip appointments={appointments} />
      <div className="space-y-3">
        {appointments.map((appt) => (
          <TodayCard
            key={appt.id}
            appt={appt}
            onComplete={handleComplete}
            onNoShow={handleNoShow}
            onCancel={handleCancel}
            actingId={isPending ? actingId : null}
          />
        ))}
      </div>
    </div>
  );
};

export default TodayTab;
