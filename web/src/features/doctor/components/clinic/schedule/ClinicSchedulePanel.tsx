import React, { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import {
  useDoctorSchedule,
  useSetSchedule,
  useUpdateSchedule,
  useDeleteScheduleDay,
} from "../../../hooks/useDoctorSchedule";
import Spinner from "../../../../../shared/components/ui/Spinner";
import {
  type DayOfWeek,
  type ClinicScheduleRequest,
  type ScheduleEntry,
} from "../../../types/doctor.clinic.types";
import { AppError } from "../../../../../shared/utils/errorParser";
import { toast } from "sonner";
import ScheduleViewList from "./ScheduleViewList";
import ScheduleEditor from "./ScheduleEditor";

const ALL_DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DEFAULT_ENTRY: ScheduleEntry = {
  dayOfWeek: "MONDAY",
  startTime: "09:00:00",
  endTime: "17:00:00",
};

interface ClinicSchedulePanelProps {
  clinicId: string;
}

const ClinicSchedulePanel: React.FC<ClinicSchedulePanelProps> = ({
  clinicId,
}) => {
  const { data: scheduleRes, isLoading } = useDoctorSchedule(clinicId);
  const { mutate: setSchedule, isPending: isSetting } =
    useSetSchedule(clinicId);
  const { mutate: updateSchedule, isPending: isUpdating } =
    useUpdateSchedule(clinicId);
  const { mutate: deleteDay, isPending: isDeleting } =
    useDeleteScheduleDay(clinicId);

  const existingSchedules = scheduleRes?.data ?? [];
  const hasSchedule = existingSchedules.length > 0;
  const isPending = isSetting || isUpdating;

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingDay, setDeletingDay] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(thirtyDaysLater);
  const [entries, setEntries] = useState<ScheduleEntry[]>([
    { ...DEFAULT_ENTRY },
  ]);

  const openEditor = () => {
    if (hasSchedule) {
      // Populate form from live data — no stale prop dependency
      setEntries(
        existingSchedules.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      );
    } else {
      setEntries([{ ...DEFAULT_ENTRY }]);
    }
    setFormError(null);
    setIsEditing(true);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setFormError(null);
    setEntries([{ ...DEFAULT_ENTRY }]);
  };

  const handleAddEntry = () => {
    const usedDays = entries.map((e) => e.dayOfWeek);
    const nextAvailable = ALL_DAYS.find((d) => !usedDays.includes(d));
    if (!nextAvailable) {
      toast.error("All 7 days are already added");
      return;
    }
    setEntries((prev) => [
      ...prev,
      { dayOfWeek: nextAvailable, startTime: "09:00:00", endTime: "17:00:00" },
    ]);
  };

  const handleEntryChange = (index: number, updated: ScheduleEntry) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? updated : e)));
  };

  const handleEntryRemove = (index: number) => {
    if (entries.length === 1) {
      toast.error("At least one day is required in a schedule");
      return;
    }
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    if (!startDate || !endDate) {
      setFormError("Start date and end date are required");
      return false;
    }
    if (startDate > endDate) {
      setFormError("End date must be after start date");
      return false;
    }
    for (const e of entries) {
      if (e.startTime >= e.endTime) {
        setFormError(`End time must be after start time for ${e.dayOfWeek}`);
        return false;
      }
    }
    // Guard against duplicates introduced via rapid UI interaction
    const days = entries.map((e) => e.dayOfWeek);
    if (new Set(days).size !== days.length) {
      setFormError("Each day can only appear once");
      return false;
    }
    return true;
  };

  const handleSave = () => {
    setFormError(null);
    if (!validate()) return;

    const payload: ClinicScheduleRequest = {
      schedules: entries,
      startDate,
      endDate,
    };

    const onSuccess = () => {
      toast.success(
        hasSchedule ? "Schedule updated" : "Schedule set successfully",
      );
      closeEditor();
    };
    const onError = (err: AppError) => setFormError(err.message);

    hasSchedule
      ? updateSchedule(payload, { onSuccess, onError })
      : setSchedule(payload, { onSuccess, onError });
  };

  const handleDeleteDay = (dayOfWeek: string) => {
    if (!window.confirm(`Remove ${dayOfWeek} from schedule?`)) return;
    setDeletingDay(dayOfWeek);
    deleteDay(dayOfWeek, {
      onSuccess: () => {
        toast.success(`${dayOfWeek} schedule removed`);
        setDeletingDay(null);
      },
      onError: (err: AppError) => {
        toast.error(err.message);
        setDeletingDay(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Spinner size="sm" />
        <span className="text-xs text-gray-400">Loading schedule...</span>
      </div>
    );
  }

  return (
    <div className="border-t border-white/10 pt-4 mt-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-blue-400/80" />
          <p className="text-xs font-semibold text-gray-200">Schedule</p>
        </div>
        {!isEditing && (
          <button
            onClick={openEditor}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium rounded-lg border border-blue-500/20 transition-colors"
          >
            <Plus size={11} />
            {hasSchedule ? "Edit Schedule" : "Set Schedule"}
          </button>
        )}
      </div>

      {/* View mode */}
      {!isEditing &&
        (hasSchedule ? (
          <ScheduleViewList
            schedules={existingSchedules}
            deletingDay={deletingDay}
            isDeleting={isDeleting}
            onDeleteDay={handleDeleteDay}
          />
        ) : (
          <p className="text-xs text-gray-500 italic">
            No schedule configured yet
          </p>
        ))}

      {/* Edit mode */}
      {isEditing && (
        <ScheduleEditor
          startDate={startDate}
          endDate={endDate}
          minDate={today}
          entries={entries}
          isPending={isPending}
          formError={formError}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onEntryChange={handleEntryChange}
          onEntryRemove={handleEntryRemove}
          onAddEntry={handleAddEntry}
          onSave={handleSave}
          onCancel={closeEditor}
        />
      )}
    </div>
  );
};

export default ClinicSchedulePanel;
