import React, {useState} from 'react';
import {Plus, Trash2, CalendarDays, Check, X} from 'lucide-react';
import {
    useDoctorSchedule,
    useSetSchedule,
    useUpdateSchedule,
    useDeleteScheduleDay,
} from '../hooks/useDoctorSchedule';
import {FormError} from '../../../shared/components/ui/FormError';
import Spinner from '../../../shared/components/ui/Spinner';
import {
    DAY_LABELS,
    type DayOfWeek,
    type ClinicScheduleRequest,
    type ScheduleEntry,
} from '../types/doctor.clinic.types';
import {AppError} from '../../../shared/utils/errorParser';
import {toast} from 'sonner';

const ALL_DAYS: DayOfWeek[] = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
];

interface ScheduleEntryRowProps {
    entry: ScheduleEntry;
    onChange: (updated: ScheduleEntry) => void;
    onRemove: () => void;
    existingDays: DayOfWeek[];
}

const ScheduleEntryRow: React.FC<ScheduleEntryRowProps> = ({entry, onChange, onRemove, existingDays}) => {
    const availableDays = ALL_DAYS.filter(
        (d) => d === entry.dayOfWeek || !existingDays.includes(d),
    );

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <select
                value={entry.dayOfWeek}
                onChange={(e) => onChange({...entry, dayOfWeek: e.target.value as DayOfWeek})}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-500 bg-white min-w-[110px]"
            >
                {availableDays.map((d) => (
                    <option key={d} value={d}>{d}</option>
                ))}
            </select>
            <input
                type="time"
                value={entry.startTime.slice(0, 5)}
                onChange={(e) => onChange({...entry, startTime: `${e.target.value}:00`})}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
                type="time"
                value={entry.endTime.slice(0, 5)}
                onChange={(e) => onChange({...entry, endTime: `${e.target.value}:00`})}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
                onClick={onRemove}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
                <X size={13}/>
            </button>
        </div>
    );
};

interface Props {
    clinicId: string;
    hasExistingSchedule: boolean; // true if clinic.schedules.length > 0
}

const ClinicSchedulePanel: React.FC<Props> = ({clinicId}) => {
    const {data: scheduleRes, isLoading} = useDoctorSchedule(clinicId);
    const {mutate: setSchedule, isPending: isSetting} = useSetSchedule(clinicId);
    const {mutate: updateSchedule, isPending: isUpdating} = useUpdateSchedule(clinicId);
    const {mutate: deleteDay, isPending: isDeleting} = useDeleteScheduleDay(clinicId);

    const existingSchedules = scheduleRes?.data ?? [];
    const hasSchedule = existingSchedules.length > 0;

    const [isEditing, setIsEditing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [deletingDay, setDeletingDay] = useState<string | null>(null);

    // Form state for add/edit
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(thirtyDaysLater);
    const [entries, setEntries] = useState<ScheduleEntry[]>([
        {dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '17:00:00'},
    ]);

    const openEditor = () => {
        if (hasSchedule) {
            // Populate from existing
            setEntries(existingSchedules.map((s) => ({
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
            })));
        }
        setIsEditing(true);
        setFormError(null);
    };

    const closeEditor = () => {
        setIsEditing(false);
        setFormError(null);
        // Reset to defaults for next open
        setEntries([{dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '17:00:00'}]);
    };

    const addEntry = () => {
        const usedDays = entries.map((e) => e.dayOfWeek);
        const nextAvailable = ALL_DAYS.find((d) => !usedDays.includes(d));
        if (!nextAvailable) {
            toast.error('All 7 days are already added');
            return;
        }
        setEntries((prev) => [
            ...prev,
            {dayOfWeek: nextAvailable, startTime: '09:00:00', endTime: '17:00:00'},
        ]);
    };

    const updateEntry = (index: number, updated: ScheduleEntry) => {
        setEntries((prev) => prev.map((e, i) => (i === index ? updated : e)));
    };

    const removeEntry = (index: number) => {
        if (entries.length === 1) return; // keep at least one row
        setEntries((prev) => prev.filter((_, i) => i !== index));
    };

    const validate = (): boolean => {
        if (!startDate || !endDate) {
            setFormError('Start date and end date are required');
            return false;
        }
        if (startDate > endDate) {
            setFormError('End date must be after start date');
            return false;
        }
        for (const e of entries) {
            if (e.startTime >= e.endTime) {
                setFormError(`End time must be after start time for ${e.dayOfWeek}`);
                return false;
            }
        }
        const days = entries.map((e) => e.dayOfWeek);
        if (new Set(days).size !== days.length) {
            setFormError('Each day can only appear once');
            return false;
        }
        return true;
    };

    const handleSave = () => {
        setFormError(null);
        if (!validate()) return;

        const payload: ClinicScheduleRequest = {schedules: entries, startDate, endDate};

        const onSuccess = () => {
            toast.success(hasSchedule ? 'Schedule updated' : 'Schedule set successfully');
            closeEditor();
        };
        const onError = (err: AppError) => setFormError(err.message);

        if (hasSchedule) {
            updateSchedule(payload, {onSuccess, onError});
        } else {
            setSchedule(payload, {onSuccess, onError});
        }
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

    const isPending = isSetting || isUpdating;
    const entryDays = entries.map((e) => e.dayOfWeek);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 py-2">
                <Spinner size="sm"/>
                <span className="text-xs text-gray-400">Loading schedule...</span>
            </div>
        );
    }

    return (
        <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-teal-600"/>
                    <p className="text-xs font-semibold text-gray-700">Schedule</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={openEditor}
                        className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-lg hover:bg-teal-100 transition-colors"
                    >
                        <Plus size={11}/>
                        {hasSchedule ? 'Edit Schedule' : 'Set Schedule'}
                    </button>
                )}
            </div>

            {/* Existing schedules view */}
            {!isEditing && (
                <>
                    {hasSchedule ? (
                        <div className="space-y-1.5">
                            {existingSchedules.map((s) => (
                                <div
                                    key={s.id}
                                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-xs font-semibold w-8 ${s.active ? 'text-teal-700' : 'text-gray-400'}`}
                                        >
                                            {DAY_LABELS[s.dayOfWeek]}
                                        </span>
                                        <span className="text-xs text-gray-600">
                                            {s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)}
                                        </span>
                                        {!s.active && (
                                            <span className="text-xs text-gray-400 italic">Inactive</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteDay(s.dayOfWeek)}
                                        disabled={isDeleting && deletingDay === s.dayOfWeek}
                                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors disabled:opacity-50"
                                    >
                                        {isDeleting && deletingDay === s.dayOfWeek
                                            ? <Spinner size="sm"/>
                                            : <Trash2 size={12}/>
                                        }
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 italic">No schedule configured yet</p>
                    )}
                </>
            )}

            {/* Editor */}
            {isEditing && (
                <div className="space-y-4 bg-gray-50 rounded-xl p-4">
                    <FormError error={formError}/>

                    {/* Date range */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Effective From
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                min={today}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Effective Until
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate || today}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    {/* Day entries */}
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-600">Days & Times</p>
                        {entries.map((entry, idx) => (
                            <ScheduleEntryRow
                                key={idx}
                                entry={entry}
                                onChange={(updated) => updateEntry(idx, updated)}
                                onRemove={() => removeEntry(idx)}
                                existingDays={entryDays.filter((_, i) => i !== idx)}
                            />
                        ))}
                        {entries.length < 7 && (
                            <button
                                onClick={addEntry}
                                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium mt-1"
                            >
                                <Plus size={12}/>
                                Add another day
                            </button>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={closeEditor}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-xs rounded-lg hover:bg-white transition-colors"
                        >
                            <X size={12}/> Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isPending}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-lg hover:bg-teal-700 disabled:opacity-60 transition-colors"
                        >
                            {isPending ? <Spinner size="sm"/> : <Check size={12}/>}
                            Save Schedule
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicSchedulePanel;