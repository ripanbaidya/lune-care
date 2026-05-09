import React from "react";
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
    <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 rounded-2xl border border-white/10 px-6 py-6 shadow-md hover:border-white/20 transition-all duration-300 backdrop-blur-xl">
      <p className="text-xs font-bold text-gray-400/70 uppercase tracking-widest mb-5">
        Complete Payment
      </p>

      {stripeState ? (
        /* Stripe Card Form */
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center border border-indigo-500/20">
              <span className="text-sm">🔵</span>
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
