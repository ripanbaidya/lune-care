import React from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { appointmentDetailPath } from "../../../routes/routePaths";
import type { PaymentResponse, PaymentStatus } from "../types/payment.types";

// Status config
const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  INITIATED: {
    label: "Initiated",
    className: "bg-amber-900/30 text-amber-300 border border-amber-700/40",
    icon: <Clock size={11} />,
  },
  SUCCESS: {
    label: "Completed",
    className: "bg-green-900/30 text-green-300 border border-green-700/40",
    icon: <CheckCircle2 size={11} />,
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-900/30 text-red-300 border border-red-700/40",
    icon: <XCircle size={11} />,
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-blue-900/30 text-blue-300 border border-blue-700/40",
    icon: <RotateCcw size={11} />,
  },
  REFUND_FAILED: {
    label: "Refund Failed",
    className: "bg-red-900/30 text-red-300 border border-red-700/40",
    icon: <XCircle size={11} />,
  },
};

interface PaymentCardProps {
  payment: PaymentResponse;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ payment }) => {
  const cfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.INITIATED;

  const amountRupees = payment.amount;
  const txnId =
    payment.razorpayPaymentId ?? payment.stripePaymentIntentId ?? payment.id;

  const formattedDate = new Date(payment.createdAt).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
  const formattedTime = new Date(payment.createdAt).toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const iconBg =
    payment.status === "SUCCESS"
      ? "bg-green-900/30"
      : payment.status === "FAILED"
        ? "bg-red-900/30"
        : payment.status === "REFUNDED"
          ? "bg-blue-900/30"
          : "bg-amber-900/30";
  const iconColor =
    payment.status === "SUCCESS"
      ? "text-green-400"
      : payment.status === "FAILED"
        ? "text-red-400"
        : payment.status === "REFUNDED"
          ? "text-blue-400"
          : "text-amber-400";
  const amountColor =
    payment.status === "SUCCESS"
      ? "text-green-400"
      : payment.status === "FAILED"
        ? "text-red-400 line-through"
        : "text-gray-300";

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
      <div className="flex items-start justify-between gap-3">
        {/* Left: icon + info */}
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
          >
            <CreditCard size={18} className={iconColor} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-200">
                {payment.gateway === "RAZORPAY" ? "Razorpay" : "Stripe"}
              </p>
              <span
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.className}`}
              >
                {cfg.icon}
                {cfg.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-mono truncate max-w-[200px]">
              {txnId}
            </p>
          </div>
        </div>

        {/* Right: amount */}
        <div className="text-right flex-shrink-0">
          <p
            className={`text-base font-bold flex items-center gap-0.5 justify-end ${amountColor}`}
          >
            <IndianRupee size={14} />
            {amountRupees.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{payment.currency}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/30">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar size={11} />
          {formattedDate} · {formattedTime}
        </div>
        <Link
          to={appointmentDetailPath(payment.appointmentId)}
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          View Appointment
          <ExternalLink size={10} />
        </Link>
      </div>
    </div>
  );
};
