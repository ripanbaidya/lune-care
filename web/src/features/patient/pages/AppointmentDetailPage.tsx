import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  useAppointment,
  useCancelPatientAppointment,
} from "../hooks/usePatientAppointments";
import {
  useInitiateRazorpay,
  useInitiateStripe,
  useVerifyRazorpay,
  useVerifyStripe,
} from "../../payment/hooks/usePayment";
import type { GatewayType } from "../../payment/types/payment.types";
import { AppError } from "../../../shared/utils/errorParser";
import { toast } from "sonner";
import { ROUTES } from "../../../routes/routePaths";

// Imported components
import AppointmentStatusBanner from "../components/appointments/AppointmentStatusBanner";
import AppointmentDetailsCard from "../components/appointments/AppointmentDetailsCard";
import PaymentSection from "../components/appointments/PaymentSection";
import FeedbackSection from "../components/appointments/FeedbackSection";
import CancelAppointmentButton from "../components/appointments/CancelAppointmentButton";
import AppointmentNotFound from "../components/appointments/AppointmentNotFound";

// Razorpay types
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

const loadScript = (src: string): Promise<boolean> =>
  new Promise((resolve) => {
    if (src.includes("razorpay") && typeof window.Razorpay === "function")
      return resolve(true);

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

type StatusKey =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

const AppointmentDetailPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  // Data fetching
  const { data: apptRes, isLoading, refetch } = useAppointment(appointmentId!);
  const appointment = apptRes?.data;

  // Payment mutations
  const { mutate: initiateRazorpay, isPending: isInitiatingRzp } =
    useInitiateRazorpay();
  const { mutate: initiateStripe, isPending: isInitiatingStripe } =
    useInitiateStripe();
  const { mutate: verifyRazorpay, isPending: isVerifyingRzp } =
    useVerifyRazorpay();
  const { mutate: verifyStripe, isPending: isVerifyingStripe } =
    useVerifyStripe();
  const { mutate: cancelAppointment, isPending: isCancelling } =
    useCancelPatientAppointment();

  // State management
  const [selectedGateway, setSelectedGateway] =
    React.useState<GatewayType>("RAZORPAY");
  const [paymentProcessing, setPaymentProcessing] = React.useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = React.useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = React.useState(false);
  const [stripeState, setStripeState] = React.useState<{
    clientSecret: string;
    stripeKey: string;
    paymentIntentId: string;
    amount: number;
  } | null>(null);

  // Computed values
  const isInitiating = isInitiatingRzp || isInitiatingStripe;
  const isVerifying = isVerifyingRzp || isVerifyingStripe;
  const status = appointment?.status as StatusKey;
  const isPendingPayment = status === "PENDING_PAYMENT";
  const isConfirmed = status === "CONFIRMED";
  const isCompleted = status === "COMPLETED";

  // ── Razorpay Payment Flow ──
  const handleRazorpayPayment = async () => {
    if (!appointment) return;
    setPaymentProcessing(true);

    const loaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js",
    );
    if (!loaded) {
      toast.error("Failed to load Razorpay. Check your internet connection.");
      setPaymentProcessing(false);
      return;
    }

    initiateRazorpay(
      { appointmentId: appointment.id, gatewayType: "RAZORPAY" },
      {
        onSuccess: (res) => {
          const data = res.data;
          const rzp = new window.Razorpay({
            key:
              data.razorpayKey || (import.meta.env.VITE_RAZORPAY_KEY_ID ?? ""),
            amount: data.amount,
            currency: data.currency,
            order_id: data.razorpayOrderId,
            name: "LuneCare",
            description: "Doctor Consultation Fee",
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
                    toast.success("Payment successful! Appointment confirmed.");
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
                toast("Payment cancelled.", { icon: "💸" });
                setPaymentProcessing(false);
              },
            },
            theme: { color: "#2563EB" },
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

  // ── Stripe Payment Flow ──
  const handleStripeInitiate = () => {
    if (!appointment) return;
    setPaymentProcessing(true);

    initiateStripe(
      { appointmentId: appointment.id, gatewayType: "STRIPE" },
      {
        onSuccess: (res) => {
          const data = res.data;
          setStripeState({
            clientSecret: data.clientSecret,
            stripeKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "",
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
      { appointmentId: appointment.id, stripePaymentIntentId: paymentIntentId },
      {
        onSuccess: () => {
          toast.success("Payment successful! Appointment confirmed.");
          setStripeState(null);
          refetch();
        },
        onError: (err: AppError) => {
          toast.error(`Verification failed: ${err.message}`);
        },
      },
    );
  };

  const handlePaymentInitiate = () => {
    if (selectedGateway === "RAZORPAY") {
      handleRazorpayPayment();
    } else {
      handleStripeInitiate();
    }
  };

  // ── Appointment Cancellation ──
  const handleCancel = () => {
    if (!appointment) return;
    if (
      !window.confirm("Cancel this appointment? This action cannot be undone.")
    )
      return;

    cancelAppointment(
      { appointmentId: appointment.id, reason: "Cancelled by patient" },
      {
        onSuccess: () => {
          toast.success("Appointment cancelled.");
          refetch();
        },
        onError: (err: AppError) => toast.error(err.message),
      },
    );
  };

  // ── Render: Not Found State ──
  if (!isLoading && !appointment) {
    return <AppointmentNotFound isLoading={false} />;
  }

  // ── Render: Loading State ──
  if (isLoading) {
    return <AppointmentNotFound isLoading={true} />;
  }

  const appointmentData = appointment!;

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.patientAppointments)}
          className="p-2 rounded-lg hover:bg-white/5 text-gray-400 transition-all duration-200"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Appointment Details</h1>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            {appointmentData.id}
          </p>
        </div>
      </div>

      {/* ── Status Banner ── */}
      <AppointmentStatusBanner
        status={status}
        cancellationReason={appointmentData.cancellationReason}
        appointmentDate={appointmentData.appointmentDate}
      />

      {/* ── Appointment Details ── */}
      <AppointmentDetailsCard
        appointmentDate={appointmentData.appointmentDate}
        startTime={appointmentData.startTime}
        endTime={appointmentData.endTime}
        consultationFees={appointmentData.consultationFees}
        paymentId={appointmentData.paymentId}
      />

      {/* ── Payment Section (Only for PENDING_PAYMENT) ── */}
      {isPendingPayment && (
        <PaymentSection
          selectedGateway={selectedGateway}
          onGatewayChange={setSelectedGateway}
          consultationFees={appointmentData.consultationFees ?? 0}
          paymentProcessing={paymentProcessing}
          isInitiating={isInitiating}
          isVerifying={isVerifying}
          isVerifyingStripe={isVerifyingStripe}
          stripeState={stripeState}
          onPaymentInitiate={handlePaymentInitiate}
          onStripeSuccess={handleStripeSuccess}
          onStripeError={(msg) => toast.error(msg)}
          onStripeCancel={() => {
            setStripeState(null);
            setPaymentProcessing(false);
          }}
        />
      )}

      {/* ── Feedback Section (Only for COMPLETED) ── */}
      {isCompleted && (
        <FeedbackSection
          appointmentId={appointmentData.id}
          doctorId={appointmentData.doctorId}
          feedbackSubmitted={feedbackSubmitted}
          showFeedbackForm={showFeedbackForm}
          onShowFormChange={setShowFeedbackForm}
          onFeedbackSubmit={() => setFeedbackSubmitted(true)}
        />
      )}

      {/* ── Cancel Button (Not shown when Stripe form is open) ─��� */}
      {(isPendingPayment || isConfirmed) && !stripeState && (
        <CancelAppointmentButton
          isCancelling={isCancelling}
          onCancel={handleCancel}
        />
      )}

      {/* ── Back Link ── */}
      <div className="pt-3">
        <Link
          to={ROUTES.patientAppointments}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
        >
          <ArrowLeft size={14} />
          Back to Appointments
        </Link>
      </div>
    </div>
  );
};

export default AppointmentDetailPage;
