import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {CalendarDays, X} from 'lucide-react';
import {usePatientAppointmentHistory, useCancelPatientAppointment} from '../hooks/usePatientAppointments';
import Spinner from '../../../shared/components/ui/Spinner';
import {APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS} from '../../doctor/types/doctor.appointment.types';
import type {AppointmentBookingResponse} from '../../appointment/services/appointmentService';
import {toast} from 'sonner';
import {AppError} from '../../../shared/utils/errorParser';

type Tab = 'upcoming' | 'completed' | 'cancelled';

const STATUS_MAP: Record<Tab, string[]> = {
    upcoming: ['CONFIRMED', 'PENDING_PAYMENT'],
    completed: ['COMPLETED'],
    cancelled: ['CANCELLED', 'NO_SHOW'],
};

const AppointmentCard: React.FC<{
    appt: AppointmentBookingResponse;
    onCancel?: (id: string) => void;
    isCancelling?: boolean;
}> = ({appt, onCancel, isCancelling}) => {
    const statusClass = APPOINTMENT_STATUS_COLORS[appt.status as keyof typeof APPOINTMENT_STATUS_COLORS]
        ?? 'bg-gray-100 text-gray-600';
    const statusLabel = APPOINTMENT_STATUS_LABELS[appt.status as keyof typeof APPOINTMENT_STATUS_LABELS]
        ?? appt.status;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <CalendarDays size={14} className="text-blue-500"/>
                        <span className="text-sm font-semibold text-gray-800">
                            {appt.slotDate} · {appt.startTime?.slice(0, 5)} – {appt.endTime?.slice(0, 5)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500">Appointment ID: {appt.id.slice(0, 8)}...</p>
                    {appt.cancellationReason && (
                        <p className="text-xs text-red-500 mt-1">Reason: {appt.cancellationReason}</p>
                    )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${statusClass}`}>
                    {statusLabel}
                </span>
            </div>

            {/* Cancel button for confirmed/pending appointments */}
            {(appt.status === 'CONFIRMED' || appt.status === 'PENDING_PAYMENT') && onCancel && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                        onClick={() => onCancel(appt.id)}
                        disabled={isCancelling}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                        {isCancelling ? <Spinner size="sm"/> : <X size={12}/>}
                        Cancel Appointment
                    </button>
                </div>
            )}
        </div>
    );
};

const PatientAppointmentsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('upcoming');
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const {data, isLoading} = usePatientAppointmentHistory(0, 50);
    const {mutate: cancel} = useCancelPatientAppointment();

    const all = data?.data?.content ?? [];
    const filtered = all.filter((a) => STATUS_MAP[activeTab].includes(a.status));

    const handleCancel = (appointmentId: string) => {
        const reason = window.prompt('Reason for cancellation (optional):') ?? 'Patient request';
        setCancellingId(appointmentId);
        cancel(
            {appointmentId, reason},
            {
                onSuccess: () => {
                    toast.success('Appointment cancelled');
                    setCancellingId(null);
                },
                onError: (err: AppError) => {
                    toast.error(err.message);
                    setCancellingId(null);
                },
            },
        );
    };

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
                    </button>
                ))}
            </div>

            {/* Content */}
            <div>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Spinner size="md"/>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center py-14 gap-3">
                        <CalendarDays size={32} className="text-gray-200"/>
                        <p className="text-sm text-gray-400">
                            No {activeTab} appointments
                        </p>
                        {activeTab === 'upcoming' && (
                            <Link
                                to="/find-doctors"
                                className="text-sm text-blue-600 font-medium hover:underline"
                            >
                                Find a Doctor →
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((appt) => (
                            <AppointmentCard
                                key={appt.id}
                                appt={appt}
                                onCancel={activeTab === 'upcoming' ? handleCancel : undefined}
                                isCancelling={cancellingId === appt.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientAppointmentsPage;