import React from "react";
import { LockKeyhole } from "lucide-react";
import Spinner from "../../../../shared/components/ui/Spinner";
import StripeCardForm from "./StripeCardForm";
import PaymentGatewaySelect from "./PaymentGatewaySelect";
import type { GatewayType } from "../../../payment/types/payment.types";

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
  onPaymentInitiate: () => void;
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
  onPaymentInitiate,
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
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-300">
          <LockKeyhole size={11} />
          Secured Checkout
        </div>
      </div>

      {stripeState ? (
        /* Stripe Card Form */
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
        /* Gateway Selection */
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
