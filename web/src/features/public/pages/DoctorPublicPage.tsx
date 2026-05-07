import React, {useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Languages,
    MapPin,
    Phone,
    Stethoscope,
    UserCircle,
} from 'lucide-react';
import {useDoctorPublic} from '../hooks/usePublicDoctor';
import {useAvailableSlots, useBookAppointment} from '../../patient/hooks/usePatientAppointments.ts';
import {SPECIALIZATION_LABELS} from '../../doctor/types/doctor.types';
import {CLINIC_TYPE_LABELS, DAY_LABELS} from '../../doctor/types/doctor.clinic.types';
import {ROUTES} from '../../../routes/routePaths';
import {useAuth} from '../../../shared/hooks/useAuth';
import Spinner from '../../../shared/components/ui/Spinner';
import {AppError} from '../../../shared/utils/errorParser';
import {toast} from 'sonner';

// Format "09:00:00" → "9:00 AM"
const formatTime = (time: string): string => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

// Today's date in "YYYY-MM-DD"
const todayStr = () => new Date().toISOString().split('T')[0];
// Max date: today + 60 days
const maxDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().split('T')[0];
};

const DoctorPublicPage: React.FC = () => {
    const {doctorId} = useParams<{doctorId: string}>();
    const navigate = useNavigate();
    const {isAuthenticated, isPatient} = useAuth();

    const {data: doctorRes, isLoading: doctorLoading} = useDoctorPublic(doctorId!);
    const doctor = doctorRes?.data;

    const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(todayStr());
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    // const [bookingSuccess, setBookingSuccess] = useState(false);

    const activeClinic = doctor?.clinics.find((c) => c.id === selectedClinicId)
        ?? doctor?.clinics.find((c) => c.active)
        ?? doctor?.clinics[0];

    // Auto-select clinic once doctor loads
    React.useEffect(() => {
        if (doctor && !selectedClinicId) {
            const active = doctor.clinics.find((c) => c.active) ?? doctor.clinics[0];
            if (active) setSelectedClinicId(active.id);
        }
    }, [doctor, selectedClinicId]);

    // Reset slot when date or clinic changes
    React.useEffect(() => {
        setSelectedSlotId(null);
    }, [selectedDate, selectedClinicId]);

    const clinicForSlots = activeClinic;
    const {data: slotsRes, isLoading: slotsLoading, isFetching: slotsFetching} = useAvailableSlots(
        doctorId!,
        clinicForSlots?.id ?? '',
        selectedDate,
        !!clinicForSlots && !!selectedDate,
    );
    const slots = slotsRes?.data ?? [];

    const {mutate: bookAppointment, isPending: isBooking} = useBookAppointment();

    const handleBook = () => {
        if (!isAuthenticated) {
            // Save where to return after login
            navigate(`${ROUTES.login}?redirect=/doctors/${doctorId}`);
            return;
        }
        if (!isPatient) {
            toast.error('Only patients can book appointments.');
            return;
        }
        if (!selectedSlotId) {
            toast.error('Please select a time slot.');
            return;
        }

        bookAppointment(
            {slotId: selectedSlotId},
            {
                onSuccess: (res) => {
                    const appointmentId = res.data.id;
                    toast.success('Appointment booked!');
                    navigate(`/patient/appointments/${appointmentId}`);
                },
                onError: (err: AppError) => {
                    if (err.status === 409) {
                        toast.error('This slot was just booked by someone else. Please pick another.');
                    } else {
                        toast.error(err.message);
                    }
                },
            },
        );
    };

    if (doctorLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Spinner size="lg"/>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
                <p className="text-gray-500">Doctor not found.</p>
                <Link to="/search" className="text-blue-600 hover:underline text-sm">Back to Search</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Nav */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
                        <ArrowLeft size={18}/>
                    </button>
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Stethoscope size={14} className="text-white"/>
                        </div>
                        <span className="text-base font-bold text-gray-900">LuneCare</span>
                    </Link>
                    <div className="flex-1"/>
                    {!isAuthenticated && (
                        <Link
                            to={ROUTES.login}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Sign In to Book
                        </Link>
                    )}
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                {/* ── Doctor Info Card ── */}
                <div className="bg-white rounded-xl border border-gray-200 px-6 py-5">
                    <div className="flex items-start gap-5">
                        {doctor.profilePhotoUrl ? (
                            <img
                                src={doctor.profilePhotoUrl}
                                alt="Doctor"
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 flex-shrink-0"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 border-2 border-gray-100">
                                <UserCircle size={44} className="text-blue-300"/>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-gray-900">
                                Dr. {doctor.firstName} {doctor.lastName}
                            </h1>
                            {doctor.specialization && (
                                <p className="text-sm text-blue-600 font-medium mt-0.5">
                                    {SPECIALIZATION_LABELS[doctor.specialization]}
                                </p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                {doctor.qualification && (
                                    <span className="text-xs text-gray-500">{doctor.qualification}</span>
                                )}
                                {doctor.yearsOfExperience != null && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock size={11}/>
                                        {doctor.yearsOfExperience} yrs experience
                                    </span>
                                )}
                                {doctor.languagesSpoken.length > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Languages size={11}/>
                                        {doctor.languagesSpoken.join(', ')}
                                    </span>
                                )}
                            </div>
                            {doctor.bio && (
                                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{doctor.bio}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── Left: Clinics ── */}
                    <div className="lg:col-span-1 space-y-3">
                        <h2 className="text-sm font-semibold text-gray-700">Clinic Locations</h2>
                        {doctor.clinics.map((clinic) => (
                            <button
                                key={clinic.id}
                                onClick={() => setSelectedClinicId(clinic.id)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${
                                    selectedClinicId === clinic.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 bg-white hover:border-blue-300'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{clinic.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {CLINIC_TYPE_LABELS[clinic.type] || clinic.type}
                                        </p>
                                    </div>
                                    {selectedClinicId === clinic.id && (
                                        <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0 mt-0.5"/>
                                    )}
                                </div>
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <MapPin size={10} className="flex-shrink-0"/>
                                        <span className="truncate">{clinic.addressLine}, {clinic.city}</span>
                                    </div>
                                    {clinic.contactNumber && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <Phone size={10} className="flex-shrink-0"/>
                                            {clinic.contactNumber}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mt-1.5">
                                        <span className="text-xs text-gray-500">
                                            {clinic.consultationDurationMinutes} min
                                        </span>
                                        <span className="text-sm font-bold text-teal-600">
                                            ₹{clinic.consultationFees}
                                        </span>
                                    </div>
                                </div>

                                {/* Schedule Days */}
                                {clinic.schedules.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100">
                                        {clinic.schedules.filter((s) => s.active).map((s) => (
                                            <span
                                                key={s.id}
                                                className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                                            >
                                                {DAY_LABELS[s.dayOfWeek as keyof typeof DAY_LABELS] || s.dayOfWeek.slice(0, 3)}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ── Right: Date + Slots + Book ── */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Date Picker */}
                        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar size={15} className="text-blue-600"/>
                                <h2 className="text-sm font-semibold text-gray-700">Select a Date</h2>
                            </div>
                            <input
                                type="date"
                                value={selectedDate}
                                min={todayStr()}
                                max={maxDateStr()}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Slots */}
                        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock size={15} className="text-blue-600"/>
                                <h2 className="text-sm font-semibold text-gray-700">Available Slots</h2>
                                {(slotsLoading || slotsFetching) && <Spinner size="sm"/>}
                            </div>

                            {!selectedClinicId ? (
                                <p className="text-sm text-gray-400 py-4">Select a clinic to see available slots.</p>
                            ) : slotsLoading ? (
                                <div className="flex justify-center py-8">
                                    <Spinner size="md"/>
                                </div>
                            ) : slots.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-gray-400">No slots available for this date.</p>
                                    <p className="text-xs text-gray-400 mt-1">Try a different date.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {slots.map((slot) => (
                                        <button
                                            key={slot.id}
                                            onClick={() => setSelectedSlotId(slot.id)}
                                            disabled={slot.status !== 'AVAILABLE'}
                                            className={`py-2.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                                                slot.status !== 'AVAILABLE'
                                                    ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                                                    : selectedSlotId === slot.id
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                                            }`}
                                        >
                                            {formatTime(slot.startTime)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Booking Summary + CTA */}
                        {selectedSlotId && activeClinic && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
                                <p className="text-sm font-semibold text-blue-900 mb-2">Appointment Summary</p>
                                <div className="space-y-1 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-blue-700">Doctor</span>
                                        <span className="font-medium text-blue-900">
                                            Dr. {doctor.firstName} {doctor.lastName}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-blue-700">Clinic</span>
                                        <span className="font-medium text-blue-900">{activeClinic.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-blue-700">Date</span>
                                        <span className="font-medium text-blue-900">
                                            {new Date(selectedDate).toLocaleDateString('en-IN', {
                                                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-blue-700">Time</span>
                                        <span className="font-medium text-blue-900">
                                            {formatTime(slots.find((s) => s.id === selectedSlotId)?.startTime ?? '')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-blue-700">Consultation Fee</span>
                                        <span className="font-bold text-teal-700">₹{activeClinic.consultationFees}</span>
                                    </div>
                                </div>

                                {!isAuthenticated ? (
                                    <Link
                                        to={`${ROUTES.login}?redirect=/doctors/${doctorId}`}
                                        className="block w-full text-center py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Sign In to Book Appointment
                                    </Link>
                                ) : !isPatient ? (
                                    <p className="text-xs text-center text-red-500">
                                        Only patients can book appointments.
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleBook}
                                        disabled={isBooking}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                                    >
                                        {isBooking ? <Spinner size="sm"/> : null}
                                        Confirm Booking
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorPublicPage;