import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {
    Receipt, ChevronLeft, ChevronRight, IndianRupee, Calendar,
    CreditCard, CheckCircle2, XCircle, Clock, RotateCcw, ExternalLink,
} from 'lucide-react';
import {usePaymentHistory} from '../hooks/usePayment';
import Spinner from '../../../shared/components/ui/Spinner';
import {appointmentDetailPath, ROUTES} from '../../../routes/routePaths';
import type {PaymentResponse, PaymentStatus} from '../types/payment.types';

// Status config
const STATUS_CONFIG: Record<
    PaymentStatus,
    { label: string; className: string; icon: React.ReactNode }
> = {
    INITIATED: {
        label: 'Initiated',
        className: 'bg-amber-100 text-amber-700',
        icon: <Clock size={11}/>,
    },
    SUCCESS: {
        label: 'Completed',
        className: 'bg-green-100 text-green-700',
        icon: <CheckCircle2 size={11}/>,
    },
    FAILED: {
        label: 'Failed',
        className: 'bg-red-100 text-red-700',
        icon: <XCircle size={11}/>,
    },
    REFUNDED: {
        label: 'Refunded',
        className: 'bg-blue-100 text-blue-700',
        icon: <RotateCcw size={11}/>,
    },
    REFUND_FAILED: {
        label: 'Refund Failed',
        className: 'bg-red-100 text-red-700',
        icon: <XCircle size={11}/>,
    }
};

// Payment Card
const PaymentCard: React.FC<{ payment: PaymentResponse }> = ({payment}) => {
    const cfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.INITIATED;

    const amountRupees = payment.amount;
    const txnId =
        payment.razorpayPaymentId ?? payment.stripePaymentIntentId ?? payment.id;

    const formattedDate = new Date(payment.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const formattedTime = new Date(payment.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const iconBg =
        payment.status === 'SUCCESS' ? 'bg-green-100' :
            payment.status === 'FAILED' ? 'bg-red-100' :
                payment.status === 'REFUNDED' ? 'bg-blue-100' :
                    'bg-amber-100';
    const iconColor =
        payment.status === 'SUCCESS' ? 'text-green-600' :
            payment.status === 'FAILED' ? 'text-red-500' :
                payment.status === 'REFUNDED' ? 'text-blue-600' :
                    'text-amber-600';
    const amountColor =
        payment.status === 'SUCCESS' ? 'text-green-700' :
            payment.status === 'FAILED' ? 'text-red-600 line-through' :
                'text-gray-800';

    return (
        <div
            className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between gap-3">
                {/* Left: icon + info */}
                <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                        <CreditCard size={18} className={iconColor}/>
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900">
                                {payment.gateway === 'RAZORPAY' ? 'Razorpay' : 'Stripe'}
                            </p>
                            <span
                                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.className}`}
                            >
                                {cfg.icon}
                                {cfg.label}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono truncate max-w-[200px]">
                            {txnId}
                        </p>
                    </div>
                </div>

                {/* Right: amount */}
                <div className="text-right flex-shrink-0">
                    <p className={`text-base font-bold flex items-center gap-0.5 justify-end ${amountColor}`}>
                        <IndianRupee size={14}/>
                        {amountRupees.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{payment.currency}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={11}/>
                    {formattedDate} · {formattedTime}
                </div>
                <Link
                    to={appointmentDetailPath(payment.appointmentId)}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                    View Appointment
                    <ExternalLink size={10}/>
                </Link>
            </div>
        </div>
    );
};

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center py-16 gap-3">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Receipt size={24} className="text-gray-400"/>
        </div>
        <p className="text-sm font-medium text-gray-700">No payment records yet</p>
        <p className="text-xs text-gray-400 text-center max-w-xs">
            Payments for your appointments will appear here once you complete a booking.
        </p>
        <Link
            to={ROUTES.findDoctors}
            className="mt-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
            Find a Doctor
        </Link>
    </div>
);

// ── Summary Stat ──────────────────────────────────────────────────────────────
interface StatProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

const Stat: React.FC<StatProps> = ({label, value, icon, color}) => (
    <div className={`rounded-xl border px-4 py-3 ${color}`}>
        <div className="flex items-center gap-1.5 mb-1">{icon}</div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
    </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const PaymentHistoryPage: React.FC = () => {
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 8;

    const {data, isLoading} = usePaymentHistory(page, PAGE_SIZE);
    const payments = data?.data?.content ?? [];
    const pageInfo = data?.data?.page;
    const totalPages = pageInfo?.totalPages ?? 0;
    const totalElements = pageInfo?.totalElements ?? 0;

    const completed = payments.filter((p) => p.status === 'SUCCESS');
    const totalSpentRupees = completed.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-5 pb-8">
            {/* ── Header ── */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Payment History</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    All payment transactions for your appointments
                </p>
            </div>

            {/* ── Summary stats (only when data is loaded) ── */}
            {!isLoading && payments.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    <Stat
                        label="Total"
                        value={String(totalElements)}
                        icon={<Receipt size={13} className="text-gray-500"/>}
                        color="bg-white border-gray-200"
                    />
                    <Stat
                        label="Successful"
                        value={String(completed.length)}
                        icon={<CheckCircle2 size={13} className="text-green-500"/>}
                        color="bg-green-50 border-green-100"
                    />
                    <Stat
                        label="Spent (page)"
                        value={`₹${totalSpentRupees.toLocaleString('en-IN')}`}
                        icon={<IndianRupee size={13} className="text-blue-500"/>}
                        color="bg-blue-50 border-blue-100"
                    />
                </div>
            )}

            {/* ── Content ── */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Spinner size="lg"/>
                </div>
            ) : payments.length === 0 ? (
                <EmptyState/>
            ) : (
                <div className="space-y-3">
                    {payments.map((p) => (
                        <PaymentCard key={p.id} payment={p}/>
                    ))}
                </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-gray-400">
                        Page {page + 1} of {totalPages} · {totalElements} total
                    </p>
                    <div className="flex items-center gap-2">
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

export default PaymentHistoryPage;