import React, {useState} from 'react';
import {CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, UserCircle, X, XCircle,} from 'lucide-react';
import {
    useCancelAppointment,
    useDoctorAppointmentHistory,
    useDoctorTodayAppointments,
    useMarkAppointmentComplete,
    useMarkNoShow,
} from '../hooks/useDoctorAppointments';
import Spinner from '../../../shared/components/ui/Spinner';
import type {AppointmentResponse} from '../types/doctor.appointment.types';
import {APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS} from '../types/doctor.appointment.types';
import {AppError} from '../../../shared/utils/errorParser';
import {toast} from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const fmtDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

// ─── Today's Appointment Card ─────────────────────────────────────────────────

interface TodayCardProps {
    appt: AppointmentResponse;
    onComplete: (id: string) => void;
    onNoShow: (id: string) => void;
    onCancel: (id: string, reason: string) => void;
    actingId: string | null;
}

const TodayCard: React.FC<TodayCardProps> = ({appt, onComplete, onNoShow, onCancel, actingId}) => {
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const isActing = actingId === appt.id;
    const statusClass =
        APPOINTMENT_STATUS_COLORS[appt.status as keyof typeof APPOINTMENT_STATUS_COLORS] ??
        'bg-gray-100 text-gray-600';
    const statusLabel =
        APPOINTMENT_STATUS_LABELS[appt.status as keyof typeof APPOINTMENT_STATUS_LABELS] ??
        appt.status;

    const canAct = appt.status === 'CONFIRMED';

    const handleCancelSubmit = () => {
        if (!cancelReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }
        onCancel(appt.id, cancelReason.trim());
        setShowCancelForm(false);
        setCancelReason('');
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <UserCircle size={20} className="text-teal-600"/>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-gray-400">Patient ID</p>
                        <p className="text-sm font-medium text-gray-800 font-mono truncate max-w-[160px]">
                            {appt.patientId}
                        </p>
                    </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusClass}`}>
                    {statusLabel}
                </span>
            </div>

            {/* Time info */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                    <Clock size={11}/>
                    {fmtTime(appt.startTime)} – {fmtTime(appt.endTime)}
                </span>
                <span className="flex items-center gap-1">
                    <CalendarDays size={11}/>
                    {fmtDate(appt.slotDate)}
                </span>
            </div>

            {/* Cancellation reason (if already cancelled) */}
            {appt.status === 'CANCELLED' && appt.cancellationReason && (
                <p className="text-xs text-red-400 mb-3 truncate">
                    Reason: {appt.cancellationReason}
                </p>
            )}

            {/* Action buttons — only for CONFIRMED */}
            {canAct && !showCancelForm && (
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => onComplete(appt.id)}
                        disabled={isActing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {isActing ? <Spinner size="sm"/> : <CheckCircle2 size={12}/>}
                        Mark Complete
                    </button>
                    <button
                        onClick={() => onNoShow(appt.id)}
                        disabled={isActing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 text-white text-xs font-medium rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                    >
                        {isActing ? <Spinner size="sm"/> : <XCircle size={12}/>}
                        No Show
                    </button>
                    <button
                        onClick={() => setShowCancelForm(true)}
                        disabled={isActing}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                        <X size={12}/>
                        Cancel
                    </button>
                </div>
            )}

            {/* Inline cancel form */}
            {showCancelForm && (
                <div className="space-y-2 mt-2">
                    <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Reason for cancellation..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setShowCancelForm(false);
                                setCancelReason('');
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-xs rounded-lg hover:bg-gray-50"
                        >
                            <X size={11}/> Discard
                        </button>
                        <button
                            onClick={handleCancelSubmit}
                            disabled={isActing}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                            {isActing ? <Spinner size="sm"/> : null}
                            Confirm Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Today Tab

const TodayTab: React.FC = () => {
    const {data, isLoading} = useDoctorTodayAppointments();
    const {mutate: markComplete, isPending: isCompleting} = useMarkAppointmentComplete();
    const {mutate: markNoShow, isPending: isNoShow} = useMarkNoShow();
    const {mutate: cancelAppt, isPending: isCancelling} = useCancelAppointment();

    const [actingId, setActingId] = useState<string | null>(null);

    const appointments = data?.data ?? [];
    const isPending = isCompleting || isNoShow || isCancelling;

    const handleComplete = (id: string) => {
        setActingId(id);
        markComplete(id, {
            onSuccess: () => {
                toast.success('Appointment marked as completed');
                setActingId(null);
            },
            onError: (err: AppError) => {
                toast.error(err.message);
                setActingId(null);
            },
        });
    };

    const handleNoShow = (id: string) => {
        if (!window.confirm('Mark this appointment as no-show?')) return;
        setActingId(id);
        markNoShow(id, {
            onSuccess: () => {
                toast.success('Appointment marked as no-show');
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
        cancelAppt({appointmentId: id, reason}, {
            onSuccess: () => {
                toast.success('Appointment cancelled');
                setActingId(null);
            },
            onError: (err: AppError) => {
                toast.error(err.message);
                setActingId(null);
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="md"/>
            </div>
        );
    }

    if (appointments.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center py-14 gap-3">
                <CalendarDays size={32} className="text-gray-200"/>
                <p className="text-sm text-gray-400">No appointments scheduled for today</p>
            </div>
        );
    }

    const confirmed = appointments.filter((a) => a.status === 'CONFIRMED');
    // const others = appointments.filter((a) => a.status !== 'CONFIRMED');

    return (
        <div className="space-y-4">
            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    {label: 'Total', value: appointments.length, color: 'text-gray-800'},
                    {label: 'Confirmed', value: confirmed.length, color: 'text-blue-700'},
                    {
                        label: 'Completed',
                        value: appointments.filter((a) => a.status === 'COMPLETED').length,
                        color: 'text-green-700'
                    },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-center">
                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-gray-400">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Cards */}
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

// History Tab

type HistoryFilter = 'all' | 'completed' | 'cancelled' | 'no_show';

const STATUS_FILTER_MAP: Record<HistoryFilter, string[]> = {
    all: ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'PENDING_PAYMENT'],
    completed: ['COMPLETED'],
    cancelled: ['CANCELLED'],
    no_show: ['NO_SHOW'],
};

const HISTORY_TABS: { key: HistoryFilter; label: string }[] = [
    {key: 'all', label: 'All'},
    {key: 'completed', label: 'Completed'},
    {key: 'cancelled', label: 'Cancelled'},
    {key: 'no_show', label: 'No Show'},
];

const HistoryTab: React.FC = () => {
    const [filter, setFilter] = useState<HistoryFilter>('all');
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 10;

    const {data, isLoading} = useDoctorAppointmentHistory(page, PAGE_SIZE);
    const {mutate: markComplete, isPending: isCompleting} = useMarkAppointmentComplete();
    const {mutate: markNoShow, isPending: isNoShow} = useMarkNoShow();
    const {mutate: cancelAppt, isPending: isCancelling} = useCancelAppointment();
    const [actingId, setActingId] = useState<string | null>(null);

    const all = data?.data?.content ?? [];
    const isPending = isCompleting || isNoShow || isCancelling;

    const handleComplete = (id: string) => {
        setActingId(id);
        markComplete(id, {
            onSuccess: () => { toast.success('Marked as completed'); setActingId(null); },
            onError: (err: AppError) => { toast.error(err.message); setActingId(null); },
        });
    };
    const handleNoShow = (id: string) => {
        if (!window.confirm('Mark as no-show?')) return;
        setActingId(id);
        markNoShow(id, {
            onSuccess: () => { toast.success('Marked as no-show'); setActingId(null); },
            onError: (err: AppError) => { toast.error(err.message); setActingId(null); },
        });
    };
    const handleCancel = (id: string, reason: string) => {
        setActingId(id);
        cancelAppt({ appointmentId: id, reason }, {
            onSuccess: () => { toast.success('Appointment cancelled'); setActingId(null); },
            onError: (err: AppError) => { toast.error(err.message); setActingId(null); },
        });
    };

    const pageInfo = data?.data?.page;
    const totalPages = pageInfo?.totalPages ?? 0;

    const filtered = all.filter((a) => STATUS_FILTER_MAP[filter].includes(a.status));

    return (
        <div className="space-y-4">
            {/* Sub-tabs */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden w-fit">
                {HISTORY_TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => {
                            setFilter(t.key);
                            setPage(0);
                        }}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            filter === t.key
                                ? 'bg-teal-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Spinner size="md"/>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center py-14 gap-3">
                    <CalendarDays size={32} className="text-gray-200"/>
                    <p className="text-sm text-gray-400">No {filter === 'all' ? '' : filter.replace('_', '-')} appointments</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((appt) => (
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
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-gray-400">Page {page + 1} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14}/> Prev
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight size={14}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Page

type MainTab = 'today' | 'history';

const DoctorAppointmentsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<MainTab>('today');

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Appointments</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage your patient appointments</p>
            </div>

            {/* Main tabs */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden w-fit">
                {([
                    {key: 'today' as MainTab, label: "Today's"},
                    {key: 'history' as MainTab, label: 'History'},
                ]).map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                            activeTab === t.key
                                ? 'bg-teal-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {activeTab === 'today' ? <TodayTab/> : <HistoryTab/>}
        </div>
    );
};

export default DoctorAppointmentsPage;