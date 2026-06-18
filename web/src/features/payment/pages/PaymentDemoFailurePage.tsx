import React from "react";
import { AlertTriangle, ArrowLeft, RefreshCcw, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Spinner from "../../../shared/components/ui/Spinner";
import { ROUTES, appointmentDetailPath } from "../../../routes/routePaths";
import { usePaymentForAppointment } from "../hooks/usePayment";
import { GATEWAY_LABELS } from "../types/payment.types";

const PaymentDemoFailurePage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { data, isLoading } = usePaymentForAppointment(appointmentId ?? "");
  const payment = data?.data;

  if (!appointmentId) {
    return (
      <div className="rounded-2xl border border-white/10 bg-gray-950/70 p-6">
        <p className="text-sm text-gray-300">Missing appointment reference.</p>
        <Link
          to={ROUTES.patientAppointments}
          className="mt-4 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft size={14} />
          Back to appointments
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-500/10 via-gray-950/80 to-black p-6 shadow-2xl shadow-red-950/10">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
            <XCircle size={28} className="text-red-300" />
          </div>
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">
              <AlertTriangle size={12} />
              Demo payment failed
            </div>
            <h1 className="mt-3 text-2xl font-bold text-white">
              Payment failure
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              This was an intentional demo failure, so you can show the failure
              state and recovery path.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-gray-400">
              <Spinner size="sm" />
              <span className="ml-2">Loading payment details...</span>
            </div>
          ) : payment ? (
            <>
              <Row label="Appointment" value={payment.appointmentId} />
              <Row label="Gateway" value={GATEWAY_LABELS[payment.gateway]} />
              <Row label="Status" value="Failed" />
              <Row
                label="Reason"
                value={payment.failureReason ?? "Demo failure recorded"}
              />
              <Row
                label="Demo session"
                value={payment.demoSessionId ?? payment.id}
              />
            </>
          ) : (
            <p className="text-sm text-gray-400">Payment record not found.</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={appointmentDetailPath(appointmentId)}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-400 transition-colors"
          >
            <RefreshCcw size={16} />
            Retry appointment
          </Link>
          <Link
            to={ROUTES.patientPayments}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-700/70 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:bg-gray-800/60 transition-colors"
          >
            View payment history
          </Link>
        </div>
      </div>
    </div>
  );
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-100 text-right break-all">{value}</span>
    </div>
  );
}

export default PaymentDemoFailurePage;
