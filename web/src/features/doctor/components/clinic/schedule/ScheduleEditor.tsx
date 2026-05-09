import React from "react";
import { Plus, X, Check } from "lucide-react";
import { FormError } from "../../../../../shared/components/ui/FormError";
import Spinner from "../../../../../shared/components/ui/Spinner";
import {
  type DayOfWeek,
  type ScheduleEntry,
} from "../../../types/doctor-clinic.types";
import ScheduleEntryRow from "./ScheduleEntryRow";

const ALL_DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const dateInputCls =
  "px-2 py-1.5 border border-gray-600 rounded-lg text-xs text-white bg-gray-800/50 " +
  "outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
  "transition-all duration-200 hover:border-gray-500";

interface ScheduleEditorProps {
  startDate: string;
  endDate: string;
  minDate: string;
  entries: ScheduleEntry[];
  isPending: boolean;
  formError: string | null;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onEntryChange: (index: number, updated: ScheduleEntry) => void;
  onEntryRemove: (index: number) => void;
  onAddEntry: () => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Pure UI editor for clinic schedule.
 * All state and mutation logic lives in ClinicSchedulePanel (the orchestrator).
 */
const ScheduleEditor: React.FC<ScheduleEditorProps> = ({
  startDate,
  endDate,
  minDate,
  entries,
  isPending,
  formError,
  onStartDateChange,
  onEndDateChange,
  onEntryChange,
  onEntryRemove,
  onAddEntry,
  onSave,
  onCancel,
}) => (
  <div className="space-y-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
    <FormError error={formError} />

    {/* Date range */}
    <div className="flex items-end gap-4 flex-wrap">
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Effective From
        </label>
        <input
          type="date"
          value={startDate}
          min={minDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className={dateInputCls}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">
          Effective Until
        </label>
        <input
          type="date"
          value={endDate}
          min={startDate || minDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className={dateInputCls}
        />
      </div>
    </div>

    {/* Day entries */}
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-300">Days & Times</p>
      {entries.map((entry, idx) => (
        <ScheduleEntryRow
          key={entry.dayOfWeek} // stable key — days are unique in the list
          entry={entry}
          takenDays={entries
            .filter((_, i) => i !== idx)
            .map((e) => e.dayOfWeek)}
          onChange={(updated) => onEntryChange(idx, updated)}
          onRemove={() => onEntryRemove(idx)}
        />
      ))}

      {entries.length < ALL_DAYS.length && (
        <button
          onClick={onAddEntry}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium mt-1 transition-colors"
        >
          <Plus size={12} />
          Add another day
        </button>
      )}
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-gray-200 text-xs rounded-lg transition-all duration-200 hover:bg-gray-800/50"
      >
        <X size={12} /> Cancel
      </button>
      <button
        onClick={onSave}
        disabled={isPending}
        className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isPending ? <Spinner size="sm" /> : <Check size={12} />}
        Save Schedule
      </button>
    </div>
  </div>
);

export default ScheduleEditor;
