import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DayOfWeek } from "../../types/doctor-clinic.types";

interface CalendarPickerProps {
  availableDates: Set<string>;
  selectedDate: string;
  onSelect: (date: string) => void;
  clinicDays: DayOfWeek[];
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_HEADER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BACKEND_TO_JS_DAY: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  availableDates,
  selectedDate,
  onSelect,
  clinicDays,
}) => {
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const clinicJsDays = useMemo(
    () => new Set(clinicDays.map((d) => BACKEND_TO_JS_DAY[d])),
    [clinicDays],
  );

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const formatDate = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${viewYear}-${mm}-${dd}`;
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-white">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_HEADER.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-gray-600 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const dateStr = formatDate(day);
          const cellDate = new Date(viewYear, viewMonth, day);
          const isPast = cellDate < today;
          const jsDayOfWeek = cellDate.getDay();
          const isClinicDay = clinicJsDays.has(jsDayOfWeek);
          const hasSlots = availableDates.has(dateStr);
          const isSelected = dateStr === selectedDate;
          const isToday = cellDate.getTime() === today.getTime();
          const isSelectable = !isPast && isClinicDay;

          return (
            <button
              key={dateStr}
              disabled={!isSelectable}
              onClick={() => onSelect(dateStr)}
              className={[
                "relative mx-auto w-8 h-8 rounded-full text-xs font-medium transition-colors flex items-center justify-center",
                isSelected
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/40"
                  : hasSlots && isSelectable
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : isClinicDay && !isPast
                      ? "text-gray-300 hover:bg-white/10"
                      : "text-gray-700 cursor-not-allowed",
                isToday && !isSelected ? "ring-1 ring-blue-400" : "",
              ].join(" ")}
            >
              {day}
              {hasSlots && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
          <span className="text-xs text-gray-500">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className="text-xs text-gray-500">Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full ring-1 ring-blue-400 bg-transparent" />
          <span className="text-xs text-gray-500">Today</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarPicker;
