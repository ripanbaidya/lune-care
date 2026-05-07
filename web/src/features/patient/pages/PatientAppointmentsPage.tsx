import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {CalendarDays, ChevronLeft, ChevronRight, Clock} from 'lucide-react';
import {usePatientAppointmentHistory} from '../hooks/usePatientAppointments';
import {
    STATUS_COLORS,
    STATUS_LABELS,
    type AppointmentResponse,
    type AppointmentStatus
} from '../types/patient.appointment.types';
import Spinner from '../../../shared/components/ui/Spinner';

type Tab = 'upcoming' | 'completed' | 'cancelled';

const TAB_STATUSES: Record<Tab, AppointmentStatus[]> = {
    upcoming: ['PENDING_PAYMENT', 'CONFIRMED'],
    completed: ['COMPLETED'],
    cancelled: ['CANCELLED', 'NO_SHOW'],
};

const formatTime = (time: string): string => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const AppointmentCard: React.FC<{ appointment: AppointmentResponse }> = ({appointment}) => (
    <Link
        to={`/patient/appointments/${appointment.id}`}
        className="block bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all"
    >
        <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[appointment.status]}`}>
                        {STATUS_LABELS[appointment.status]}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-blue-500"/>
                        {new Date(appointment.appointmentDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                        })}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-blue-500"/>
                        {formatTime(appointment.startTime)}
                    </span>
                </div>
                {appointment.cancellationReason && appointment.status === 'CANCELLED' && (
                    <p className="text-xs text-gray-400 mt-2">
                        Reason: {appointment.cancellationReason}
                    </p>
                )}
            </div>
            <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-teal-700">₹{appointment.consultationFees}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                    {appointment.paymentId ? 'Paid' : 'Unpaid'}
                </p>
            </div>
        </div>
    </Link>
);

const PatientAppointmentsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('upcoming');
    const [page, setPage] = useState(0);

    // Fetch all — we filter client-side by tab
    // For production scale you'd pass status filters to backend, but your API
    // doesn't expose status filter on history endpoint, so client-side is correct here
    const {data: historyRes, isLoading} = usePatientAppointmentHistory(page, 20);
    const all: AppointmentResponse[] = historyRes?.data?.content ?? [];
    const pageInfo = historyRes?.data?.page;
    const totalPages = pageInfo?.totalPages ?? 0;

    const filtered = all.filter((a) => TAB_STATUSES[activeTab].includes(a.status));

    const tabs: { key: Tab; label: string; count: number }[] = [
        {
            key: 'upcoming',
            label: 'Upcoming',
            count: all.filter((a) => TAB_STATUSES.upcoming.includes(a.status)).length,
        },
        {
            key: 'completed',
            label: 'Completed',
            count: all.filter((a) => TAB_STATUSES.completed.includes(a.status)).length,
        },
        {
            key: 'cancelled',
            label: 'Cancelled',
            count: all.filter((a) => TAB_STATUSES.cancelled.includes(a.status)).length,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-sm text-gray-500 mt-0.5">View and manage your appointment history</p>
            </div>

            {/* Tabs */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setActiveTab(tab.key);
                            setPage(0);
                        }}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                            activeTab === tab.key
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                activeTab === tab.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 text-gray-500'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Spinner size="lg"/>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center py-16 gap-3">
                    <CalendarDays size={36} className="text-gray-300"/>
                    <p className="text-sm text-gray-500">
                        No {activeTab} appointments
                    </p>
                    {activeTab === 'upcoming' && (
                        <Link
                            to="/search"
                            className="text-sm text-blue-600 font-medium hover:underline"
                        >
                            Find a Doctor →
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((appt) => (
                        <AppointmentCard key={appt.id} appointment={appt}/>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                        <ChevronLeft size={14}/> Prev
                    </button>
                    <span className="text-sm text-gray-500">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40"
                    >
                        Next <ChevronRight size={14}/>
                    </button>
                </div>
            )}
        </div>
    );
};

export default PatientAppointmentsPage;