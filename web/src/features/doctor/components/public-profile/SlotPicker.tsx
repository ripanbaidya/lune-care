import React from "react";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import Spinner from "../../../../shared/components/ui/Spinner";
import { useAuth } from "../../../../shared/hooks/useAuth";

interface SlotPickerProps {
  selectedDate: string;
  slots: { id: string; startTime: string }[];
  slotsLoading: boolean;
  selectedSlotId: string | null;
  bookingSuccess: boolean;
  isBooking: boolean;
  onSlotToggle: (id: string) => void;
  onBook: () => void;
}

const SlotPicker: React.FC<SlotPickerProps> = ({
  selectedDate,
  slots,
  slotsLoading,
  selectedSlotId,
  bookingSuccess,
  isBooking,
  onSlotToggle,
  onBook,
}) => {
  const { isAuthenticated, isPatient } = useAuth();

  const bookLabel =
    isAuthenticated && isPatient
      ? "Book Appointment"
      : isAuthenticated
        ? "Only patients can book"
        : "Sign in to Book";

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-1.5">
        <CalendarDays size={13} />
        Available Slots — {selectedDate}
      </p>
      <div className="bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-4">
        {slotsLoading ? (
          <div className="flex items-center justify-center py-6">
            <Spinner size="sm" />
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">
              No slots available for this date.
            </p>
            <p className="text-xs text-gray-600 mt-1">Try a different date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => onSlotToggle(slot.id)}
                className={[
                  "px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150",
                  selectedSlotId === slot.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30"
                    : "bg-white/5 border-white/10 text-gray-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300",
                ].join(" ")}
              >
                {slot.startTime.slice(0, 5)}
              </button>
            ))}
          </div>
        )}

        {selectedSlotId && (
          <div className="mt-4 pt-4 border-t border-white/5">
            {bookingSuccess ? (
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <CheckCircle2 size={16} />
                Booking confirmed! Redirecting...
              </div>
            ) : (
              <button
                onClick={onBook}
                disabled={isBooking}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl disabled:opacity-60 transition-colors shadow-md shadow-blue-600/20"
              >
                {isBooking && <Spinner size="sm" />}
                {bookLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotPicker;
