import React from "react";
import { X } from "lucide-react";
import {
  DAY_LABELS,
  type DayOfWeek,
  type ScheduleEntry,
} from "../../../types/doctor-clinic.types";

const ALL_DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

// Shared input style — dark theme consistent with rest of app
const timeInputCls =
  "px-2 py-1.5 border border-gray-600 rounded-lg text-xs text-white bg-gray-800/50 " +
  "outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
  "transition-all duration-200 hover:border-gray-500";

const selectCls =
  "px-2 py-1.5 border border-gray-600 rounded-lg text-xs text-white bg-gray-800/50 " +
  "outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
  "transition-all duration-200 hover:border-gray-500 min-w-[120px]";

interface ScheduleEntryRowProps {
  entry: ScheduleEntry;
  /** Days already used by OTHER rows — used to filter the day dropdown */
  takenDays: DayOfWeek[];
  onChange: (updated: ScheduleEntry) => void;
  onRemove: () => void;
}

const ScheduleEntryRow: React.FC<ScheduleEntryRowProps> = ({
  entry,
  takenDays,
  onChange,
  onRemove,
}) => {
  // Current row's day is always available to itself; exclude other rows' days
  const availableDays = ALL_DAYS.filter(
    (d) => d === entry.dayOfWeek || !takenDays.includes(d),
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={entry.dayOfWeek}
        onChange={(e) =>
          onChange({ ...entry, dayOfWeek: e.target.value as DayOfWeek })
        }
        className={selectCls}
      >
        {availableDays.map((d) => (
          <option key={d} value={d} className="bg-gray-800 text-white">
            {DAY_LABELS[d] ?? d}
          </option>
        ))}
      </select>

      <input
        type="time"
        value={entry.startTime.slice(0, 5)}
        onChange={(e) =>
          onChange({ ...entry, startTime: `${e.target.value}:00` })
        }
        className={timeInputCls}
      />

      <span className="text-xs text-gray-500">to</span>

      <input
        type="time"
        value={entry.endTime.slice(0, 5)}
        onChange={(e) =>
          onChange({ ...entry, endTime: `${e.target.value}:00` })
        }
        className={timeInputCls}
      />

      <button
        onClick={onRemove}
        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
        aria-label={`Remove ${entry.dayOfWeek}`}
      >
        <X size={13} />
      </button>
    </div>
  );
};

export default ScheduleEntryRow;
