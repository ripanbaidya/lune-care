import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {CalendarDays, ChevronRight, Clock, IndianRupee} from 'lucide-react';
import {usePatientAppointmentHistory} from '../hooks/usePatientAppointments';
import Spinner from '../../../shared/components/ui/Spinner';
import {APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS} from '../../doctor/types/doctor.appointment.types';
import type {AppointmentBookingResponse} from '../../appointment/services/appointmentService';
import {appointmentDetailPath} from '../../../routes/routePaths';
import {ROUTES} from '../../../routes/routePaths';

type Tab = 'upcoming' | 'completed' | 'cancelled';

const STATUS_MAP: Record<Tab, string[]> = {
    upcoming: ['CONFIRMED', 'PENDING_PAYMENT'],
    completed: ['COMPLETED'],
    cancelled: ['CANCELLED', 'NO_SHOW'],
};

// ── Single appointment card — navigates to detail page on click ───────────────
const AppointmentCard: React.FC<{ appt: AppointmentBookingResponse }> = ({appt}) => {
    const navigate = useNavigate();

    const statusClass =
        APPOINTMENT_STATUS_COLORS[appt.status as keyof typeof APPOINTMENT_STATUS_COLORS] ??
        'bg-gray-100 text-gray-600';
    const statusLabel =
        APPOINTMENT_STATUS_LABELS[appt.status as keyof typeof APPOINTMENT_STATUS_LABELS] ??
        appt.status;

    const fmtTime = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
    };

    return (
        <button
            onClick={() => navigate(appointmentDetailPath(appt.id))}
            className="w-full text-left bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
        >
            <div className="flex items-start justify-between gap-3">
                {/* Left */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                        <CalendarDays size={14} className="text-blue-500 flex-shrink-0"/>
                        <span className="text-sm font-semibold text-gray-800">
                            {appt.slotDate}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Clock size={11} className="flex-shrink-0"/>
                        {fmtTime(appt.startTime)} – {fmtTime(appt.endTime)}
                    </div>
                    {appt.consultationFees != null && (
                        <div className="flex items-center gap-0.5 text-xs text-teal-700 font-medium">
                            <IndianRupee size={11}/>
                            {appt.consultationFees}
                        </div>
                    )}
                    {appt.cancellationReason && (
                        <p className="text-xs text-red-400 mt-1 truncate">
                            Reason: {appt.cancellationReason}
                        </p>
                    )}
                </div>

                {/* Right */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClass}`}>
                        {statusLabel}
                    </span>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors"/>
                </div>
            </div>
        </button>
    );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const PatientAppointmentsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('upcoming');
    const {data, isLoading} = usePatientAppointmentHistory(0, 50);

    const all = data?.data?.content ?? [];
    const filtered = all.filter((a) => STATUS_MAP[activeTab].includes(a.status));

    const TABS: { key: Tab; label: string }[] = [
        {key: 'upcoming', label: 'Upcoming'},
        {key: 'completed', label: 'Completed'},
        {key: 'cancelled', label: 'Cancelled'},
    ];

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-sm text-gray-500 mt-0.5">View and manage your appointment history</p>
            </div>

            {/* Tabs */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                            activeTab === t.key
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {t.label}
                        {t.key === 'upcoming' && all.filter((a) => STATUS_MAP.upcoming.includes(a.status)).length > 0 && (
                            <span className="ml-1.5 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                                {all.filter((a) => STATUS_MAP.upcoming.includes(a.status)).length}
                            </span>
                        )}
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
                    <p className="text-sm text-gray-400">No {activeTab} appointments</p>
                    {activeTab === 'upcoming' && (
                        <Link
                            to={ROUTES.findDoctors}
                            className="text-sm text-blue-600 font-medium hover:underline"
                        >
                            Find a Doctor →
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((appt) => (
                        <AppointmentCard key={appt.id} appt={appt}/>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientAppointmentsPage;