import React, {useEffect, useRef, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    IndianRupee,
    Loader2,
    Receipt,
    Shield, Star,
    Stethoscope,
    XCircle,
} from 'lucide-react';
import {useAppointment, useCancelPatientAppointment} from '../hooks/usePatientAppointments';
import {
    useInitiateRazorpay,
    useInitiateStripe,
    useVerifyRazorpay,
    useVerifyStripe,
} from '../../payment/hooks/usePayment';
import type {GatewayType} from '../../payment/types/payment.types';
import Spinner from '../../../shared/components/ui/Spinner';
import {AppError} from '../../../shared/utils/errorParser';
import {toast} from 'sonner';
import {ROUTES} from '../../../routes/routePaths';
import {SubmitFeedbackForm} from '../../feedback/components/SubmitFeedbackForm';

// Razorpay global types
declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
        Stripe: (key: string) => StripeInstance;
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
    modal?: { ondismiss?: () => void };
    theme?: { color?: string };
}

interface RazorpayInstance {
    open(): void;
}

interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

// Stripe global types
interface StripeInstance {
    elements: (options?: object) => StripeElements;
    confirmCardPayment: (
        clientSecret: string,
        data: object,
    ) => Promise<{
        paymentIntent?: { id: string; status: string };
        error?: { message: string };
    }>;
}

interface StripeElements {
    create: (type: string, options?: object) => StripeElement;
}

interface StripeElement {
    mount: (el: HTMLElement | string) => void;
    unmount: () => void;
    on: (event: string, handler: (e: { error?: { message: string } }) => void) => void;
}

// Script loader (idempotent)
const loadScript = (src: string): Promise<boolean> =>
    new Promise((resolve) => {
        if (typeof window.Stripe === 'function') return resolve(true);
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(true));
            existing.addEventListener('error', () => resolve(false));
            return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

// Helpers
const fmtTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const fmtDate = (d: string) => {
    if (!d) return "Date is not provided";
    const date = new Date(d);

    // check is the date valid
    if (isNaN(date.getTime())) {
        console.log("Invalid date string received!", d);
        return "Invalid date format";
    }

    return new Date(d).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
};

type StatusKey = 'PENDING_PAYMENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

const STATUS_CONFIG: Record<StatusKey, {
    bg: string; text: string; sub: string;
    icon: React.ReactNode; label: string; subtitle: string;
}> = {
    PENDING_PAYMENT: {
        bg: 'bg-amber-50 border-amber-200',
        text: 'text-amber-800',
        sub: 'text-amber-700',
        icon: <AlertCircle size={20} className="text-amber-600 flex-shrink-0"/>,
        label: 'Pending Payment',
        subtitle: 'Complete payment to confirm your appointment slot.',
    },
    CONFIRMED: {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-800',
        sub: 'text-blue-700',
        icon: <CheckCircle2 size={20} className="text-blue-600 flex-shrink-0"/>,
        label: 'Confirmed',
        subtitle: 'Your appointment is confirmed.',
    },
    COMPLETED: {
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-800',
        sub: 'text-green-700',
        icon: <CheckCircle2 size={20} className="text-green-600 flex-shrink-0"/>,
        label: 'Completed',
        subtitle: 'This appointment has been completed.',
    },
    CANCELLED: {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-800',
        sub: 'text-red-700',
        icon: <XCircle size={20} className="text-red-600 flex-shrink-0"/>,
        label: 'Cancelled',
        subtitle: 'This appointment was cancelled.',
    },
    NO_SHOW: {
        bg: 'bg-gray-50 border-gray-200',
        text: 'text-gray-700',
        sub: 'text-gray-500',
        icon: <XCircle size={20} className="text-gray-500 flex-shrink-0"/>,
        label: 'No Show',
        subtitle: 'Patient did not attend the appointment.',
    },
};

// Stripe card form component
interface StripeCardFormProps {
    clientSecret: string;
    stripeKey: string;
    onSuccess: (paymentIntentId: string) => void;
    onError: (msg: string) => void;
    onCancel: () => void;
    amount: number; // in paise
}

const StripeCardForm: React.FC<StripeCardFormProps> = ({
                                                           clientSecret,
                                                           stripeKey,
                                                           onSuccess,
                                                           onError,
                                                           onCancel,
                                                           amount,
                                                       }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const stripeRef = useRef<StripeInstance | null>(null);
    const cardElementRef = useRef<StripeElement | null>(null);
    const [ready, setReady] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            const ok = await loadScript('https://js.stripe.com/v3/');
            if (!ok || !mounted || !cardRef.current) return;

            if (!stripeKey) {
                console.error('Stripe publishable key is missing — set VITE_STRIPE_PUBLISHABLE_KEY in .env and restart Vite');
                return;
            }
            let stripe: StripeInstance;
            try {
                stripe = window.Stripe(stripeKey);
            } catch (e) {
                console.error('Failed to initialize Stripe:', e);
                return;
            }
            stripeRef.current = stripe;
            const elements = stripe.elements();
            const card = elements.create('card', {
                style: {
                    base: {
                        fontSize: '14px',
                        color: '#1f2937',
                        fontFamily: 'system-ui, sans-serif',
                        '::placeholder': {color: '#9ca3af'},
                    },
                    invalid: {color: '#ef4444'},
                },
                hidePostalCode: true,
            });
            cardElementRef.current = card;
            card.mount(cardRef.current); // 1. mount first
            card.on('change', (e) => {  // 2. then listen for changes
                setCardError(e.error?.message ?? null);
            });
            card.on('ready', () => { // 3. ready fires when iframe is visible
                if (mounted) setReady(true);
            });

        })();

        return () => {
            mounted = false;
            cardElementRef.current?.unmount();
        };
    }, [stripeKey]);

    const handlePay = async () => {
        if (!stripeRef.current || !cardElementRef.current) return;
        setProcessing(true);
        setCardError(null);

        const {paymentIntent, error} = await stripeRef.current.confirmCardPayment(
            clientSecret,
            {payment_method: {card: cardElementRef.current}},
        );

        setProcessing(false);
        if (error) {
            setCardError(error.message ?? 'Payment failed.');
            onError(error.message ?? 'Payment failed.');
        } else if (paymentIntent?.status === 'succeeded') {
            onSuccess(paymentIntent.id);
        } else {
            onError('Payment was not completed. Please try again.');
        }
    };

    return (
        <div className="space-y-4">
            <div className="p-3 border border-gray-300 rounded-lg bg-white min-h-[42px]">
                {!ready && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Loader2 size={14} className="animate-spin"/>
                        Loading card input...
                    </div>
                )}
                <div ref={cardRef}/>
            </div>
            {cardError && <p className="text-xs text-red-500">{cardError}</p>}
            <div className="flex gap-2">
                <button
                    onClick={onCancel}
                    disabled={processing}
                    className="flex-1 py-2.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handlePay}
                    disabled={!ready || processing}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                >
                    {processing ? (
                        <><Spinner size="sm"/> Processing...</>
                    ) : (
                        <><CreditCard size={14}/> Pay ₹{amount}</>
                    )}
                </button>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <Shield size={11}/>
                Secured by Stripe · 256-bit SSL
            </div>
        </div>
    );
};

// Main Page
const AppointmentDetailPage: React.FC = () => {
    const {appointmentId} = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();

    const {data: apptRes, isLoading, refetch} = useAppointment(appointmentId!);
    const appointment = apptRes?.data;

    const {mutate: initiateRazorpay, isPending: isInitiatingRzp} = useInitiateRazorpay();
    const {mutate: initiateStripe, isPending: isInitiatingStripe} = useInitiateStripe();
    const {mutate: verifyRazorpay, isPending: isVerifyingRzp} = useVerifyRazorpay();
    const {mutate: verifyStripe, isPending: isVerifyingStripe} = useVerifyStripe();
    const {mutate: cancelAppointment, isPending: isCancelling} = useCancelPatientAppointment();

    const [selectedGateway, setSelectedGateway] = useState<GatewayType>('RAZORPAY');
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    // Track whether the patient has already submitted feedback this session.
    // In a production app, the appointment response should carry feedbackId.
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);

    // When Stripe is selected and initiation succeeds, we show the card form
    const [stripeState, setStripeState] = useState<{
        clientSecret: string;
        stripeKey: string;
        paymentIntentId: string;
        amount: number;
    } | null>(null);

    const isInitiating = isInitiatingRzp || isInitiatingStripe;
    const isVerifying = isVerifyingRzp || isVerifyingStripe;

    // Razorpay flow
    const handleRazorpayPayment = async () => {
        if (!appointment) return;
        setPaymentProcessing(true);

        const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!loaded) {
            toast.error('Failed to load Razorpay. Check your internet connection.');
            setPaymentProcessing(false);
            return;
        }

        initiateRazorpay(
            {appointmentId: appointment.id, gatewayType: 'RAZORPAY'},
            {
                onSuccess: (res) => {
                    const data = res.data;
                    const rzp = new window.Razorpay({
                        // razorpayKey injected by backend; fallback to env var
                        key: data.razorpayKey || (import.meta.env.VITE_RAZORPAY_KEY_ID ?? ''),
                        amount: data.amount,
                        currency: data.currency,
                        order_id: data.razorpayOrderId,
                        name: 'LuneCare',
                        description: 'Doctor Consultation Fee',
                        handler: (response) => {
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
                                toast('Payment cancelled.', {icon: '💸'});
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
    };

    // Stripe flow
    const handleStripeInitiate = () => {
        if (!appointment) return;
        setPaymentProcessing(true);

        initiateStripe(
            {appointmentId: appointment.id, gatewayType: 'STRIPE'},
            {
                onSuccess: (res) => {
                    const data = res.data;
                    setStripeState({
                        clientSecret: data.clientSecret,
                        stripeKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '',
                        paymentIntentId: data.stripePaymentIntentId,
                        amount: data.amount,
                    });
                    setPaymentProcessing(false);
                },
                onError: (err: AppError) => {
                    toast.error(err.message);
                    setPaymentProcessing(false);
                },
            },
        );
    };

    const handleStripeSuccess = (paymentIntentId: string) => {
        if (!appointment) return;
        verifyStripe(
            {appointmentId: appointment.id, stripePaymentIntentId: paymentIntentId},
            {
                onSuccess: () => {
                    toast.success('Payment successful! Appointment confirmed.');
                    setStripeState(null);
                    refetch();
                },
                onError: (err: AppError) => {
                    toast.error(`Verification failed: ${err.message}`);
                },
            },
        );
    };

    const handlePayment = () => {
        if (selectedGateway === 'RAZORPAY') {
            handleRazorpayPayment();
        } else {
            handleStripeInitiate();
        }
    };

    const handleCancel = () => {
        if (!appointment) return;
        if (!window.confirm('Cancel this appointment? This action cannot be undone.')) return;
        cancelAppointment(
            {appointmentId: appointment.id, reason: 'Cancelled by patient'},
            {
                onSuccess: () => {
                    toast.success('Appointment cancelled.');
                    refetch();
                },
                onError: (err: AppError) => toast.error(err.message),
            },
        );
    };

    // Loading / not found
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
                <Stethoscope size={32} className="text-gray-300"/>
                <p className="text-gray-500 text-sm">Appointment not found.</p>
                <Link to={ROUTES.patientAppointments} className="text-blue-600 hover:underline text-sm">
                    ← Back to Appointments
                </Link>
            </div>
        );
    }

    const status = appointment.status as StatusKey;
    const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.CANCELLED;
    const isPendingPayment = status === 'PENDING_PAYMENT';
    const isConfirmed = status === 'CONFIRMED';

    return (
        <div className="space-y-5 pb-8">
            {/* ── Header ── */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(ROUTES.patientAppointments)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <ArrowLeft size={18}/>
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Appointment Details</h1>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{appointment.id}</p>
                </div>
            </div>

            {/* ── Status Banner ── */}
            <div className={`rounded-xl px-4 py-4 flex items-start gap-3 border ${statusCfg.bg}`}>
                {statusCfg.icon}
                <div>
                    <p className={`text-sm font-semibold ${statusCfg.text}`}>{statusCfg.label}</p>
                    <p className={`text-xs mt-0.5 ${statusCfg.sub}`}>
                        {status === 'CONFIRMED'
                            ? `Confirmed for ${fmtDate(appointment.appointmentDate)}.`
                            : status === 'CANCELLED' && appointment.cancellationReason
                                ? `Reason: ${appointment.cancellationReason}`
                                : statusCfg.subtitle}
                    </p>
                </div>
            </div>

            {/* ── Appointment Info Card ── */}
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Appointment Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar size={15} className="text-blue-600"/>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Date</p>
                            <p className="text-sm font-medium text-gray-800">{fmtDate(appointment.appointmentDate)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock size={15} className="text-blue-600"/>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Time</p>
                            <p className="text-sm font-medium text-gray-800">
                                {fmtTime(appointment.startTime)} – {fmtTime(appointment.endTime)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IndianRupee size={15} className="text-teal-600"/>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Consultation Fee</p>
                            <p className="text-sm font-semibold text-teal-700">
                                ₹{appointment.consultationFees ?? '—'}
                            </p>
                        </div>
                    </div>
                    {appointment.paymentId && (
                        <div className="flex items-center gap-3">
                            <div
                                className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Receipt size={15} className="text-green-600"/>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Payment ID</p>
                                <p className="text-xs font-mono text-gray-700 truncate max-w-[160px]">
                                    {appointment.paymentId}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Payment Section — only for PENDING_PAYMENT ── */}
            {isPendingPayment && (
                <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                        Complete Payment
                    </p>

                    {stripeState ? (
                        /* Stripe card form */
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <span className="text-sm">🔵</span>
                                </div>
                                <p className="text-sm font-medium text-gray-700">Enter card details</p>
                            </div>
                            {isVerifyingStripe ? (
                                <div className="flex items-center justify-center gap-2 py-8 text-gray-500 text-sm">
                                    <Spinner size="sm"/> Verifying payment...
                                </div>
                            ) : (
                                <StripeCardForm
                                    clientSecret={stripeState.clientSecret}
                                    stripeKey={stripeState.stripeKey}
                                    amount={stripeState.amount}
                                    onSuccess={handleStripeSuccess}
                                    onError={(msg) => toast.error(msg)}
                                    onCancel={() => {
                                        setStripeState(null);
                                        setPaymentProcessing(false);
                                    }}
                                />
                            )}
                        </div>
                    ) : (
                        /* Gateway selection */
                        <div className="space-y-4">
                            <p className="text-xs font-medium text-gray-600">Select payment gateway</p>
                            <div className="grid grid-cols-2 gap-3">
                                {(['RAZORPAY', 'STRIPE'] as GatewayType[]).map((gw) => (
                                    <button
                                        key={gw}
                                        onClick={() => setSelectedGateway(gw)}
                                        className={[
                                            'flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 text-sm font-medium transition-all',
                                            selectedGateway === gw
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 bg-white',
                                        ].join(' ')}
                                    >
                                        <span className="text-2xl">{gw === 'RAZORPAY' ? '💳' : '🔵'}</span>
                                        <span className={selectedGateway === gw ? 'text-blue-700' : 'text-gray-600'}>
                                            {gw === 'RAZORPAY' ? 'Razorpay' : 'Stripe'}
                                        </span>
                                        {selectedGateway === gw && (
                                            <span className="text-xs text-blue-500">Selected</span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-gray-50 rounded-lg px-3 py-2.5 text-xs text-gray-500">
                                {selectedGateway === 'RAZORPAY'
                                    ? '🇮🇳 Razorpay supports UPI, Net Banking, Credit/Debit Cards and Wallets.'
                                    : '🌍 Stripe supports all major international Credit/Debit Cards.'}
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={paymentProcessing || isInitiating || isVerifying}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
                            >
                                {paymentProcessing || isInitiating ? (
                                    <><Spinner size="sm"/> Preparing payment...</>
                                ) : (
                                    <><CreditCard size={15}/> Pay ₹{appointment.consultationFees}</>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                                <Shield size={11}/>
                                All transactions are encrypted and secure
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Feedback Section — only for COMPLETED appointments ── */}
            {status === 'COMPLETED' && !feedbackSubmitted && (
                <div>
                    {!showFeedbackForm ? (
                        <button
                            onClick={() => setShowFeedbackForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-100 transition-colors"
                        >
                            <Star size={14}/>
                            Leave Feedback for this Appointment
                        </button>
                    ) : (
                        <SubmitFeedbackForm
                            appointmentId={appointment.id}
                            doctorId={appointment.doctorId}
                            onSuccess={() => {
                                setFeedbackSubmitted(true);
                                setShowFeedbackForm(false);
                            }}
                            onCancel={() => setShowFeedbackForm(false)}
                        />
                    )}
                </div>
            )}

            {/* Show confirmation after submission */}
            {status === 'COMPLETED' && feedbackSubmitted && (
                <div
                    className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    <CheckCircle2 size={14}/>
                    Feedback submitted — thank you for your review!
                </div>
            )}

            {/* ── Cancel button — not shown while Stripe form is open ── */}
            {(isPendingPayment || isConfirmed) && !stripeState && (
                <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                    {isCancelling ? <Spinner size="sm"/> : <XCircle size={14}/>}
                    Cancel Appointment
                </button>
            )}

            {/* ── Back link ── */}
            <div className="pt-2">
                <Link
                    to={ROUTES.patientAppointments}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition-colors"
                >
                    <ArrowLeft size={13}/>
                    Back to Appointments
                </Link>
            </div>
        </div>
    );
};

export default AppointmentDetailPage;