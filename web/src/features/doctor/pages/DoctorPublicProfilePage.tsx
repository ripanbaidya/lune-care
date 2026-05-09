import { MapPin } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "../../../lib/axios";
import { ROUTES } from "../../../routes/routePaths";
import Spinner from "../../../shared/components/ui/Spinner";
import { useAppQuery } from "../../../shared/hooks/useAppQuery";
import { useAuth } from "../../../shared/hooks/useAuth";
import { AppError } from "../../../shared/utils/errorParser";
import type { ResponseWrapper } from "../../../types/api.types";
import { DoctorFeedbackSection } from "../../feedback/components/DoctorFeedbackSection";
import { useDoctorFeedback } from "../../feedback/hooks/useFeedback";
import {
  useAvailableSlots,
  useBookAppointment,
} from "../../patient/hooks/usePatientAppointments";
import type {
  DoctorClinicResult,
  DoctorSearchResult,
} from "../hooks/useDoctorSearch";
import type { DayOfWeek } from "../types/doctor.clinic.types";

import CalendarPicker from "../components/public-profile/CalendarPicker";
import ClinicSelector from "../components/public-profile/ClinicSelector";
import DoctorInfoCard from "../components/public-profile/DoctorInfoCard";
import PublicProfileNavbar from "../components/public-profile/PublicProfileNavbar";
import SlotPicker from "../components/public-profile/SlotPicker";

const DoctorPublicProfilePage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isPatient } = useAuth();

  const [selectedClinic, setSelectedClinic] =
    useState<DoctorClinicResult | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch doctor public profile
  const { data: doctorRes, isLoading } = useAppQuery<
    ResponseWrapper<DoctorSearchResult>
  >({
    queryKey: ["doctor", "public", doctorId],
    queryFn: async () => {
      const res = await apiClient.get<ResponseWrapper<DoctorSearchResult>>(
        `/doctor/${doctorId}/public`,
      );
      return res.data;
    },
    enabled: !!doctorId,
  });

  const doctor = doctorRes?.data;

  // Auto-select first clinic
  React.useEffect(() => {
    if (doctor?.clinics?.length && !selectedClinic) {
      setSelectedClinic(doctor.clinics[0]);
    }
  }, [doctor]);

  const { data: slotsRes, isLoading: slotsLoading } = useAvailableSlots(
    doctor?.userId,
    selectedClinic?.id,
    selectedDate,
  );
  const slots = slotsRes?.data ?? [];

  const { mutate: bookAppointment, isPending: isBooking } =
    useBookAppointment();

  const clinicDays: DayOfWeek[] = useMemo(
    () =>
      (selectedClinic?.schedules ?? [])
        .filter((s) => s.active)
        .map((s) => s.dayOfWeek as DayOfWeek),
    [selectedClinic],
  );

  const availableDatesWithSlots = useMemo(() => {
    const set = new Set<string>();
    if (selectedDate && slots.length > 0) set.add(selectedDate);
    return set;
  }, [selectedDate, slots]);

  // TODO: not working — needs fix later
  const { data: ratingRes } = useDoctorFeedback(doctor?.userId ?? "", 0, 1);
  const ratingSummary = ratingRes?.data;

  const handleBook = () => {
    if (!selectedSlotId) return;
    if (!isAuthenticated) {
      navigate(`${ROUTES.login}?redirect=/doctors/${doctorId}`);
      return;
    }
    if (!isPatient) {
      toast.error("Only patients can book appointments");
      return;
    }
    bookAppointment(selectedSlotId, {
      onSuccess: () => {
        toast.success("Appointment booked! Complete payment to confirm.");
        setBookingSuccess(true);
        setSelectedSlotId(null);
        setTimeout(() => navigate(ROUTES.patientAppointments), 2000);
      },
      onError: (err: AppError) => toast.error(err.message),
    });
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Not found ──
  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500">Doctor not found.</p>
        <Link
          to={ROUTES.home}
          className="text-blue-400 text-sm hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 70%)",
        }}
      />

      <PublicProfileNavbar />

      <div className="relative z-10 pt-20 max-w-5xl mx-auto px-4 py-6">
        {/*
         * LAYOUT FIX:
         * - lg:grid-cols-3 with col-span assignments
         * - Left sidebar is sticky so it doesn't scroll away
         * - Right panel (col-span-2) owns the scrollable booking flow
         */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── Left: Doctor Info + Clinics (sticky) ── */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-20">
            <DoctorInfoCard doctor={doctor} ratingSummary={ratingSummary} />
            <ClinicSelector
              clinics={doctor.clinics}
              selectedClinic={selectedClinic}
              onSelect={(clinic) => {
                setSelectedClinic(clinic);
                setSelectedDate("");
                setSelectedSlotId(null);
              }}
            />
          </div>

          {/* ── Right: Booking Panel ── */}
          <div className="lg:col-span-2 space-y-4">
            {selectedClinic ? (
              <>
                {/* Calendar */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 px-1">
                    Select a Date
                  </p>
                  <CalendarPicker
                    availableDates={availableDatesWithSlots}
                    selectedDate={selectedDate}
                    onSelect={(d) => {
                      setSelectedDate(d);
                      setSelectedSlotId(null);
                    }}
                    clinicDays={clinicDays}
                  />
                </div>

                {/* Slots */}
                {selectedDate && (
                  <SlotPicker
                    selectedDate={selectedDate}
                    slots={slots}
                    slotsLoading={slotsLoading}
                    selectedSlotId={selectedSlotId}
                    bookingSuccess={bookingSuccess}
                    isBooking={isBooking}
                    onSlotToggle={(id) =>
                      setSelectedSlotId(selectedSlotId === id ? null : id)
                    }
                    onBook={handleBook}
                  />
                )}
              </>
            ) : (
              <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col items-center justify-center py-16 gap-2">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1">
                  <MapPin size={22} className="text-gray-600" />
                </div>
                <p className="text-sm text-gray-500">
                  Select a clinic to see available slots
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Reviews Section — compact, dark ── */}
        {doctor && (
          <div className="mt-6 bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg px-5 py-5">
            <DoctorFeedbackSection doctorId={doctorId ?? ""} pageSize={5} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPublicProfilePage;
