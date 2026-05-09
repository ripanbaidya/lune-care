import React from "react";
import { Trash2 } from "lucide-react";
import Spinner from "../../../../../shared/components/ui/Spinner";
import { DAY_LABELS } from "../../../types/doctor.clinic.types";

interface ScheduleRow {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

interface ScheduleViewListProps {
  schedules: ScheduleRow[];
  deletingDay: string | null;
  isDeleting: boolean;
  onDeleteDay: (dayOfWeek: string) => void;
}

/**
 * Read-only view of existing schedule entries.
 * Each row shows day, time range, active status, and a delete button.
 */
const ScheduleViewList: React.FC<ScheduleViewListProps> = ({
  schedules,
  deletingDay,
  isDeleting,
  onDeleteDay,
}) => (
  <div className="space-y-1.5">
    {schedules.map((s) => (
      <div
        key={s.id}
        className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/10"
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold w-8 ${
              s.active ? "text-blue-400" : "text-gray-500"
            }`}
          >
            {DAY_LABELS[s.dayOfWeek] ?? s.dayOfWeek}
          </span>
          <span className="text-xs text-gray-300">
            {s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)}
          </span>
          {!s.active && (
            <span className="text-xs text-gray-500 italic">Inactive</span>
          )}
        </div>

        <button
          onClick={() => onDeleteDay(s.dayOfWeek)}
          disabled={isDeleting && deletingDay === s.dayOfWeek}
          className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors disabled:opacity-50"
          aria-label={`Delete ${s.dayOfWeek} schedule`}
        >
          {isDeleting && deletingDay === s.dayOfWeek ? (
            <Spinner size="sm" />
          ) : (
            <Trash2 size={12} />
          )}
        </button>
      </div>
    ))}
  </div>
);

export default ScheduleViewList;
