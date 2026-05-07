import React, {useMemo, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {
    ArrowLeft,
    Award,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    IndianRupee,
    Languages,
    MapPin,
    Phone,
    Stethoscope,
    UserCircle,
} from 'lucide-react';
import {useAppQuery} from '../../../shared/hooks/useAppQuery';
import {apiClient} from '../../../lib/axios';
import {useAvailableSlots, useBookAppointment} from '../../patient/hooks/usePatientAppointments';
import {useAuth} from '../../../shared/hooks/useAuth';
import {useAuthStore} from '../../../store/authStore';
import {authService} from '../../auth/authService';
import {ROUTES} from '../../../routes/routePaths';
import {SPECIALIZATION_LABELS} from '../types/doctor.types';
import type {DoctorClinicResult, DoctorSearchResult} from '../../public/hooks/useDoctorSearch';
import type {ResponseWrapper} from '../../../types/api.types';
import {DAY_LABELS, type DayOfWeek} from '../types/doctor.clinic.types';
import Spinner from '../../../shared/components/ui/Spinner';
import {toast} from 'sonner';
import {AppError} from '../../../shared/utils/errorParser';

// ─── Calendar Component ───────────────────────────────────────────────────────

interface CalendarPickerProps {
    /** Dates (YYYY-MM-DD) that have available slots */
    availableDates: Set<string>;
    selectedDate: string;
    onSelect: (date: string) => void;
    /** Days of week the clinic operates (e.g. ['MONDAY','WEDNESDAY']) */
    clinicDays: DayOfWeek[];
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({
                                                           availableDates,
                                                           selectedDate,
                                                           onSelect,
                                                           clinicDays,
                                                       }) => {
    const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(() => new Date().getMonth()); // 0-indexed

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const DAY_HEADER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // JS day index: 0=Sun, 1=Mon...6=Sat
    const BACKEND_TO_JS_DAY: Record<DayOfWeek, number> = {
        SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
        THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
    };

    const clinicJsDays = useMemo(
        () => new Set(clinicDays.map((d) => BACKEND_TO_JS_DAY[d])),
        [clinicDays],
    );

    // Build calendar grid
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // day of week for 1st
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({length: daysInMonth}, (_, i) => i + 1),
    ];

    const formatDate = (day: number) => {
        const mm = String(viewMonth + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
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
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft size={16}/>
                </button>
                <span className="text-sm font-semibold text-gray-800">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronRight size={16}/>
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
                {DAY_HEADER.map((d) => (
                    <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                ))}
            </div>

            {/* Date cells */}
            <div className="grid grid-cols-7 gap-y-1">
                {cells.map((day, idx) => {
                    if (day === null) return <div key={`empty-${idx}`}/>;

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
                                'relative mx-auto w-8 h-8 rounded-full text-xs font-medium transition-colors flex items-center justify-center',
                                isSelected
                                    ? 'bg-blue-600 text-white'
                                    : hasSlots && isSelectable
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : isClinicDay && !isPast
                                            ? 'text-gray-700 hover:bg-gray-100'
                                            : 'text-gray-300 cursor-not-allowed',
                                isToday && !isSelected ? 'ring-1 ring-blue-400' : '',
                            ].join(' ')}
                        >
                            {day}
                            {hasSlots && !isSelected && (
                                <span
                                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"/>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-green-200"/>
                    <span className="text-xs text-gray-500">Slots available</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-600"/>
                    <span className="text-xs text-gray-500">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full ring-1 ring-blue-400 bg-white"/>
                    <span className="text-xs text-gray-500">Today</span>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const DoctorPublicProfilePage: React.FC = () => {
    const {doctorId} = useParams<{ doctorId: string }>();
    const navigate = useNavigate();
    const {isAuthenticated, isPatient} = useAuth();
    const {clearAuth, refreshToken} = useAuthStore();

    const [selectedClinic, setSelectedClinic] = useState<DoctorClinicResult | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Fetch doctor public profile
    const {data: doctorRes, isLoading} = useAppQuery<ResponseWrapper<DoctorSearchResult>>({
        queryKey: ['doctor', 'public', doctorId],
        queryFn: async () => {
            const res = await apiClient.get<ResponseWrapper<DoctorSearchResult>>(
                `/doctor/${doctorId}/public`,
            );
            return res.data;
        },
        enabled: !!doctorId,
    });

    const doctor = doctorRes?.data;

    // Auto-select first clinic
    React.useEffect(() => {
        if (doctor?.clinics?.length && !selectedClinic) {
            setSelectedClinic(doctor.clinics[0]);
        }
    }, [doctor]);

    // ── CRITICAL FIX: use doctor.userId not doctor.id ──
    // The slots table stores doctor_id as the auth userId, not the profile id.
    const {data: slotsRes, isLoading: slotsLoading} = useAvailableSlots(
        doctor?.userId,        // ← userId, NOT id
        selectedClinic?.id,
        selectedDate,
    );
    const slots = slotsRes?.data ?? [];

    const {mutate: bookAppointment, isPending: isBooking} = useBookAppointment();

    // Derive available dates for calendar from clinic schedules
    const clinicDays: DayOfWeek[] = useMemo(
        () => (selectedClinic?.schedules ?? [])
            .filter((s) => s.active)
            .map((s) => s.dayOfWeek as DayOfWeek),
        [selectedClinic],
    );

    // Build the set of dates that have slots — we fetch slots per date so this
    // is always the slots for the currently selected date.
    // For the calendar green markers, we need to know which dates have slots.
    // We query all dates in the current month that are clinic days:
    const availableDatesWithSlots = useMemo(() => {
        // Mark currently selected date as having slots if API returned results
        const set = new Set<string>();
        if (selectedDate && slots.length > 0) set.add(selectedDate);
        return set;
    }, [selectedDate, slots]);

    const handleBook = () => {
        if (!selectedSlotId) return;

        if (!isAuthenticated) {
            // Redirect to login, then back to this page
            navigate(`${ROUTES.login}?redirect=/doctors/${doctorId}`);
            return;
        }

        if (!isPatient) {
            toast.error('Only patients can book appointments');
            return;
        }

        bookAppointment(selectedSlotId, {
            onSuccess: () => {
                toast.success('Appointment booked! Complete payment to confirm.');
                setBookingSuccess(true);
                setSelectedSlotId(null);
                // Redirect to appointments page after brief delay
                setTimeout(() => navigate(ROUTES.patientAppointments), 2000);
            },
            onError: (err: AppError) => {
                toast.error(err.message);
            },
        });
    };

    const handleLogout = async () => {
        try {
            if (refreshToken) await authService.logout({refreshToken});
        } catch {
        } finally {
            clearAuth();
            navigate(ROUTES.login, {replace: true});
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg"/>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3">
                <p className="text-gray-500">Doctor not found.</p>
                <Link to={ROUTES.home} className="text-blue-600 text-sm hover:underline">← Back to home</Link>
            </div>
        );
    }

    const getDashboardRoute = () => {
        if (isPatient) return ROUTES.patientDashboard;
        const {user} = useAuthStore.getState();
        if (user?.role === 'ROLE_DOCTOR') return ROUTES.doctorDashboard;
        return ROUTES.home;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                        >
                            <ArrowLeft size={18}/>
                        </button>
                        <Link to={ROUTES.home} className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Stethoscope size={14} className="text-white"/>
                            </div>
                            <span className="text-base font-bold text-gray-900">LuneCare</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={getDashboardRoute()}
                                    className="text-sm text-blue-600 font-medium hover:underline hidden sm:block"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to={ROUTES.login} className="text-sm text-gray-600 hover:text-blue-600">Sign
                                    In</Link>
                                <Link to={ROUTES.register}
                                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <div className="pt-14 max-w-5xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left: Doctor Info ── */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Profile card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-start gap-4">
                                {doctor.profilePhotoUrl ? (
                                    <img
                                        src={doctor.profilePhotoUrl}
                                        alt={doctor.firstName}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 flex-shrink-0"
                                    />
                                ) : (
                                    <div
                                        className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <UserCircle size={32} className="text-blue-400"/>
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h1 className="text-base font-bold text-gray-900">
                                        Dr. {doctor.firstName} {doctor.lastName}
                                    </h1>
                                    {doctor.specialization && (
                                        <p className="text-sm text-blue-600 font-medium">
                                            {SPECIALIZATION_LABELS[doctor.specialization as keyof typeof SPECIALIZATION_LABELS] ?? doctor.specialization}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {doctor.qualification && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <Award size={11}/> {doctor.qualification}
                                            </span>
                                        )}
                                        {doctor.yearsOfExperience != null && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <Clock size={11}/> {doctor.yearsOfExperience} yrs exp
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {doctor.languagesSpoken?.length > 0 && (
                                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                                    <Languages size={12}/>
                                    {doctor.languagesSpoken.join(', ')}
                                </div>
                            )}

                            {doctor.bio && (
                                <p className="mt-3 text-xs text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                                    {doctor.bio}
                                </p>
                            )}
                        </div>

                        {/* Clinics */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                                Clinic Locations
                            </p>
                            {doctor.clinics.map((clinic) => (
                                <button
                                    key={clinic.id}
                                    onClick={() => {
                                        setSelectedClinic(clinic);
                                        setSelectedDate('');
                                        setSelectedSlotId(null);
                                    }}
                                    className={[
                                        'w-full text-left bg-white rounded-xl border p-4 transition-colors',
                                        selectedClinic?.id === clinic.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300',
                                    ].join(' ')}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{clinic.name}</p>
                                            <p className="text-xs text-gray-500">{clinic.type}</p>
                                        </div>
                                        {selectedClinic?.id === clinic.id && (
                                            <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0 mt-0.5"/>
                                        )}
                                    </div>

                                    <div className="mt-2 space-y-1">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <MapPin size={11}/>
                                            {clinic.addressLine}, {clinic.city}
                                        </div>
                                        {clinic.contactNumber && (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Phone size={11}/> {clinic.contactNumber}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={11}/> {clinic.consultationDurationMinutes} min
                                            </span>
                                            <span
                                                className="text-sm font-semibold text-blue-700 flex items-center gap-0.5">
                                                <IndianRupee size={12}/>{clinic.consultationFees}
                                            </span>
                                        </div>
                                        {/* Clinic schedule days */}
                                        {clinic.schedules.filter((s) => s.active).length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {clinic.schedules.filter((s) => s.active).map((s) => (
                                                    <span key={s.id}
                                                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                        {DAY_LABELS[s.dayOfWeek as DayOfWeek]}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Right: Booking Panel ── */}
                    <div className="lg:col-span-2 space-y-4">
                        {selectedClinic ? (
                            <>
                                {/* Calendar */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                                        Select a Date
                                    </p>
                                    <CalendarPicker
                                        availableDates={availableDatesWithSlots}
                                        selectedDate={selectedDate}
                                        onSelect={(d) => {
                                            setSelectedDate(d);
                                            setSelectedSlotId(null);
                                        }}
                                        clinicDays={clinicDays}
                                    />
                                </div>

                                {/* Slots */}
                                {selectedDate && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1 flex items-center gap-1.5">
                                            <CalendarDays size={13}/>
                                            Available Slots — {selectedDate}
                                        </p>
                                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                                            {slotsLoading ? (
                                                <div className="flex items-center justify-center py-6">
                                                    <Spinner size="sm"/>
                                                </div>
                                            ) : slots.length === 0 ? (
                                                <div className="text-center py-6">
                                                    <p className="text-sm text-gray-400">No slots available for this
                                                        date.</p>
                                                    <p className="text-xs text-gray-300 mt-1">Try a different date.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                    {slots.map((slot) => (
                                                        <button
                                                            key={slot.id}
                                                            onClick={() => setSelectedSlotId(
                                                                selectedSlotId === slot.id ? null : slot.id,
                                                            )}
                                                            className={[
                                                                'px-3 py-2 rounded-lg text-xs font-medium border transition-colors',
                                                                selectedSlotId === slot.id
                                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                                    : 'border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50',
                                                            ].join(' ')}
                                                        >
                                                            {slot.startTime.slice(0, 5)}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Book button */}
                                            {selectedSlotId && (
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    {bookingSuccess ? (
                                                        <div
                                                            className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                                            <CheckCircle2 size={16}/>
                                                            Booking confirmed! Redirecting...
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={handleBook}
                                                            disabled={isBooking}
                                                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                                                        >
                                                            {isBooking && <Spinner size="sm"/>}
                                                            {isAuthenticated && isPatient
                                                                ? 'Book Appointment'
                                                                : isAuthenticated
                                                                    ? 'Only patients can book'
                                                                    : 'Sign in to Book'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div
                                className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-16 gap-2">
                                <MapPin size={28} className="text-gray-300"/>
                                <p className="text-sm text-gray-400">Select a clinic to see available slots</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorPublicProfilePage;