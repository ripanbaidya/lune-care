import React, {useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Clock,
    CreditCard,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Stethoscope,
} from 'lucide-react';
import {useAppointment, useCancelPatientAppointment} from '../hooks/usePatientAppointments';
import {useInitiatePayment, useVerifyRazorpay} from '../../payment/hooks/usePayment';
import {STATUS_LABELS} from '../types/patient.appointment.types';
import type {GatewayType} from '../../payment/types/payment.types';
import Spinner from '../../../shared/components/ui/Spinner';
import {AppError} from '../../../shared/utils/errorParser';
import {toast} from 'sonner';
import {ROUTES} from '../../../routes/routePaths';

// Razorpay types — loaded from CDN script
declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}
interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name: string;
    description: string;
    handler: (response: RazorpaySuccessResponse) => void;
    modal?: {ondismiss?: () => void};
    theme?: {color?: string};
}
interface RazorpayInstance {
    open(): void;
}
interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

const formatTime = (time: string): string => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

// Load Razorpay checkout script lazily
const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const AppointmentDetailPage: React.FC = () => {
    const {appointmentId} = useParams<{appointmentId: string}>();
    const navigate = useNavigate();

    const {data: apptRes, isLoading, refetch} = useAppointment(appointmentId!);
    const appointment = apptRes?.data;

    const {mutate: initiatePayment, isPending: isInitiating} = useInitiatePayment();
    const {mutate: verifyRazorpay, isPending: isVerifying} = useVerifyRazorpay();
    const {mutate: cancelAppointment, isPending: isCancelling} = useCancelPatientAppointment();

    const [selectedGateway, setSelectedGateway] = useState<GatewayType>('RAZORPAY');
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    const handlePayment = async () => {
        if (!appointment) return;

        if (selectedGateway === 'RAZORPAY') {
            setPaymentProcessing(true);
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                toast.error('Failed to load Razorpay. Check your internet connection.');
                setPaymentProcessing(false);
                return;
            }

            initiatePayment(
                {appointmentId: appointment.id, gatewayType: 'RAZORPAY'},
                {
                    onSuccess: (res) => {
                        const data = res.data;
                        const rzp = new window.Razorpay({
                            key: data.razorpayKey,
                            amount: data.amount,
                            currency: data.currency,
                            order_id: data.razorpayOrderId,
                            name: 'LuneCare',
                            description: 'Doctor Consultation',
                            handler: (response) => {
                                // Payment success — verify with backend
                                verifyRazorpay(
                                    {
                                        appointmentId: appointment.id,
                                        razorpayPaymentId: response.razorpay_payment_id,
                                        razorpayOrderId: response.razorpay_order_id,
                                        razorpaySignature: response.razorpay_signature,
                                    },
                                    {
                                        onSuccess: () => {
                                            toast.success('Payment successful! Appointment confirmed.');
                                            refetch();
                                            setPaymentProcessing(false);
                                        },
                                        onError: (err: AppError) => {
                                            toast.error(`Verification failed: ${err.message}`);
                                            setPaymentProcessing(false);
                                        },
                                    },
                                );
                            },
                            modal: {
                                ondismiss: () => {
                                    toast.error('Payment cancelled.');
                                    setPaymentProcessing(false);
                                },
                            },
                            theme: {color: '#2563EB'},
                        });
                        rzp.open();
                    },
                    onError: (err: AppError) => {
                        toast.error(err.message);
                        setPaymentProcessing(false);
                    },
                },
            );
        }
        // Stripe: will be added later
    };

    const handleCancel = () => {
        if (!appointment) return;
        if (!window.confirm('Cancel this appointment? This action cannot be undone.')) return;
        cancelAppointment(
            {appointmentId: appointment.id, data: {reason: 'Cancelled by patient'}},
            {
                onSuccess: () => {
                    toast.success('Appointment cancelled.');
                    refetch();
                },
                onError: (err: AppError) => toast.error(err.message),
            },
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg"/>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="flex flex-col items-center py-16 gap-3">
                <p className="text-gray-500">Appointment not found.</p>
                <Link to={ROUTES.patientAppointments} className="text-blue-600 hover:underline text-sm">
                    Back to Appointments
                </Link>
            </div>
        );
    }

    const isPendingPayment = appointment.status === 'PENDING_PAYMENT';
    const isConfirmed = appointment.status === 'CONFIRMED';
    const isCancelled = appointment.status === 'CANCELLED';
    const isCompleted = appointment.status === 'COMPLETED';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(ROUTES.patientAppointments)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <ArrowLeft size={18}/>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Appointment Details</h1>
                    <p className="text-sm text-gray-500 mt-0.5">ID: {appointment.id.slice(0, 8)}...</p>
                </div>
            </div>

            {/* Status Banner */}
            <div className={`rounded-xl px-5 py-4 flex items-center gap-3 ${
                isPendingPayment ? 'bg-amber-50 border border-amber-200' :
                    isConfirmed ? 'bg-blue-50 border border-blue-200' :
                        isCompleted ? 'bg-green-50 border border-green-200' :
                            'bg-red-50 border border-red-200'
            }`}>
                {isPendingPayment && <AlertCircle size={20} className="text-amber-600 flex-shrink-0"/>}
                {isConfirmed && <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0"/>}
                {isCompleted && <CheckCircle2 size={20} className="text-green-600 flex-shrink-0"/>}
                {(isCancelled || appointment.status === 'NO_SHOW') && (
                    <XCircle size={20} className="text-red-600 flex-shrink-0"/>
                )}
                <div>
                    <p className={`text-sm font-semibold ${
                        isPendingPayment ? 'text-amber-800' :
                            isConfirmed ? 'text-blue-800' :
                                isCompleted ? 'text-green-800' : 'text-red-800'
                    }`}>
                        {STATUS_LABELS[appointment.status]}
                    </p>
                    {isPendingPayment && (
                        <p className="text-xs text-amber-700 mt-0.5">
                            Complete payment to confirm your appointment.
                        </p>
                    )}
                    {isConfirmed && (
                        <p className="text-xs text-blue-700 mt-0.5">
                            Your appointment is confirmed. See you on {formatDate(appointment.appointmentDate)}.
                        </p>
                    )}
                    {isCancelled && appointment.cancellationReason && (
                        <p className="text-xs text-red-700 mt-0.5">
                            Reason: {appointment.cancellationReason}
                        </p>
                    )}
                </div>
            </div>

            {/* Appointment Info */}
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
                <p className="text-sm font-semibold text-gray-700 mb-4">Appointment Info</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar size={16} className="text-blue-600"/>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="text-sm font-medium text-gray-800">
                                {formatDate(appointment.appointmentDate)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock size={16} className="text-blue-600"/>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Time</p>
                            <p className="text-sm font-medium text-gray-800">
                                {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Stethoscope size={16} className="text-teal-600"/>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Consultation Fee</p>
                            <p className="text-sm font-semibold text-teal-700">₹{appointment.consultationFees}</p>
                        </div>
                    </div>
                    {appointment.paymentId && (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <CreditCard size={16} className="text-green-600"/>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Payment ID</p>
                                <p className="text-sm font-medium text-gray-800 truncate max-w-[160px]">
                                    {appointment.paymentId}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Section — only shown for PENDING_PAYMENT */}
            {isPendingPayment && (
                <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Complete Payment</p>

                    {/* Gateway Selection */}
                    <p className="text-xs font-medium text-gray-600 mb-3">Select Payment Gateway</p>
                    <div className="flex gap-3 mb-5">
                        <button
                            onClick={() => setSelectedGateway('RAZORPAY')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                selectedGateway === 'RAZORPAY'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                        >
                            <span className="text-base">💳</span>
                            Razorpay
                        </button>
                        <button
                            onClick={() => setSelectedGateway('STRIPE')}
                            disabled
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-gray-200 text-sm font-medium text-gray-300 cursor-not-allowed"
                            title="Stripe — coming soon"
                        >
                            <span className="text-base">🔵</span>
                            Stripe
                            <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Soon</span>
                        </button>
                    </div>

                    {/* Pay Button */}
                    <button
                        onClick={handlePayment}
                        disabled={paymentProcessing || isInitiating || isVerifying}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                    >
                        {(paymentProcessing || isInitiating || isVerifying) ? (
                            <><Spinner size="sm"/> Processing...</>
                        ) : (
                            <><CreditCard size={15}/> Pay ₹{appointment.consultationFees}</>
                        )}
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-3">
                        Secured by Razorpay · 256-bit SSL encryption
                    </p>
                </div>
            )}

            {/* Cancel Button — only for PENDING_PAYMENT or CONFIRMED */}
            {(isPendingPayment || isConfirmed) && (
                <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                    {isCancelling ? <Spinner size="sm"/> : <XCircle size={14}/>}
                    Cancel Appointment
                </button>
            )}
        </div>
    );
};

export default AppointmentDetailPage;