import React from "react";
import {
  LockKeyhole,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Spinner from "../../../../shared/components/ui/Spinner";
import StripeCardForm from "./StripeCardForm";
import PaymentGatewaySelect from "./PaymentGatewaySelect";
import DemoPaymentPanel from "./DemoPaymentPanel";
import type {
  GatewayType,
  PaymentResponse,
} from "../../../payment/types/payment.types";

interface PaymentSectionProps {
  selectedGateway: GatewayType;
  onGatewayChange: (gateway: GatewayType) => void;
  consultationFees: number;
  paymentProcessing: boolean;
  isInitiating: boolean;
  isVerifying: boolean;
  isVerifyingStripe: boolean;
  stripeState: {
    clientSecret: string;
    stripeKey: string;
    paymentIntentId: string;
    amount: number;
  } | null;
  demoPaymentEnabled: boolean;
  demoMode: boolean;
  demoPayment: PaymentResponse | null;
  isDemoProcessing: boolean;
  onDemoModeChange: (enabled: boolean) => void;
  onPaymentInitiate: () => void;
  onDemoInitiate: () => void;
  onDemoSuccess: () => void;
  onDemoFailure: () => void;
  onDemoBackToLive: () => void;
  onStripeSuccess: (paymentIntentId: string) => void;
  onStripeError: (msg: string) => void;
  onStripeCancel: () => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  selectedGateway,
  onGatewayChange,
  consultationFees,
  paymentProcessing,
  isInitiating,
  isVerifying,
  isVerifyingStripe,
  stripeState,
  demoPaymentEnabled,
  demoMode,
  demoPayment,
  isDemoProcessing,
  onDemoModeChange,
  onPaymentInitiate,
  onDemoInitiate,
  onDemoSuccess,
  onDemoFailure,
  onDemoBackToLive,
  onStripeSuccess,
  onStripeError,
  onStripeCancel,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/55 via-gray-900/30 to-black/50 px-5 py-5 shadow-[0_14px_36px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-xs font-bold text-gray-400/80 uppercase tracking-[0.18em]">
          Complete Payment
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {demoPaymentEnabled && (
            <button
              type="button"
              onClick={() => onDemoModeChange(!demoMode)}
              aria-pressed={demoMode}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
                demoMode
                  ? "border-amber-400/30 bg-amber-500/10 text-amber-200"
                  : "border-blue-500/25 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15",
              ].join(" ")}
            >
              {demoMode ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              Demo {demoMode ? "enabled" : "disabled"}
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-300">
            <LockKeyhole size={11} />
            Secured Checkout
          </div>
        </div>
      </div>

      {demoMode ? (
        demoPayment ? (
          <DemoPaymentPanel
            appointmentId={demoPayment.appointmentId}
            amount={demoPayment.amount}
            sessionId={demoPayment.demoSessionId ?? demoPayment.id}
            isProcessing={isDemoProcessing}
            onSuccess={onDemoSuccess}
            onFailure={onDemoFailure}
            onBackToLive={onDemoBackToLive}
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-200">
                    Demo payment is ready
                  </p>
                  <p className="text-xs text-amber-100/80 mt-1 leading-relaxed">
                    This mode bypasses external payment providers and is meant for demonstrations.
                    Start the session to show success or failure flows.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onDemoInitiate}
              disabled={isDemoProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:from-amber-500 hover:via-orange-400 hover:to-rose-400 disabled:opacity-60 transition-all duration-200 shadow-[0_12px_26px_rgba(249,115,22,0.18)]"
            >
              {isDemoProcessing ? (
                <>
                  <Spinner size="sm" />
                  <span>Preparing demo checkout...</span>
                </>
              ) : (
                <>
                  Make Demo Payment
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onDemoBackToLive}
              disabled={isDemoProcessing}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-300 border border-gray-700/70 rounded-xl hover:bg-gray-800/50 transition-colors disabled:opacity-60"
            >
              Back to live gateways
            </button>
          </div>
        )
      ) : stripeState ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
              <span className="text-sm text-blue-200">◆</span>
            </div>
            <p className="text-sm font-semibold text-gray-200">
              Enter card details
            </p>
          </div>

          {isVerifyingStripe ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-400 text-sm">
              <Spinner size="sm" />
              Verifying payment...
            </div>
          ) : (
            <StripeCardForm
              clientSecret={stripeState.clientSecret}
              stripeKey={stripeState.stripeKey}
              amount={stripeState.amount}
              onSuccess={onStripeSuccess}
              onError={onStripeError}
              onCancel={onStripeCancel}
            />
          )}
        </div>
      ) : (
        <PaymentGatewaySelect
          selectedGateway={selectedGateway}
          onGatewayChange={onGatewayChange}
          onPay={onPaymentInitiate}
          isLoading={paymentProcessing || isInitiating || isVerifying}
          consultationFees={consultationFees}
        />
      )}
    </div>
  );
};

export default PaymentSection;
