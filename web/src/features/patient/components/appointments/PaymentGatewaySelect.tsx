import React from "react";
import { CreditCard, Shield } from "lucide-react";
import type { GatewayType } from "../../../payment/types/payment.types";

interface PaymentGatewaySelectProps {
  selectedGateway: GatewayType;
  onGatewayChange: (gateway: GatewayType) => void;
  onPay: () => void;
  isLoading: boolean;
  consultationFees: number;
}

const PaymentGatewaySelect: React.FC<PaymentGatewaySelectProps> = ({
  selectedGateway,
  onGatewayChange,
  onPay,
  isLoading,
  consultationFees,
}) => {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-gray-300/80 uppercase tracking-wider">
        Select payment gateway
      </p>

      <div className="grid grid-cols-2 gap-3">
        {(["RAZORPAY", "STRIPE"] as GatewayType[]).map((gw) => (
          <button
            key={gw}
            onClick={() => onGatewayChange(gw)}
            className={[
              "flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 text-sm font-semibold transition-all duration-200",
              selectedGateway === gw
                ? "border-blue-500/60 bg-blue-600/20 backdrop-blur-md shadow-lg"
                : "border-white/10 bg-gray-900/40 backdrop-blur-md hover:border-white/20 hover:bg-gray-900/60",
            ].join(" ")}
          >
            <span className="text-2xl">{gw === "RAZORPAY" ? "💳" : "🔵"}</span>
            <span
              className={
                selectedGateway === gw ? "text-blue-300" : "text-gray-300"
              }
            >
              {gw === "RAZORPAY" ? "Razorpay" : "Stripe"}
            </span>
            {selectedGateway === gw && (
              <span className="text-xs text-blue-400 font-medium">
                ✓ Selected
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-md rounded-lg px-4 py-3 text-xs text-gray-400/90 border border-white/5">
        {selectedGateway === "RAZORPAY"
          ? "🇮🇳 Razorpay supports UPI, Net Banking, Credit/Debit Cards and Wallets."
          : "🌍 Stripe supports all major international Credit/Debit Cards."}
      </div>

      <button
        onClick={onPay}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <CreditCard size={15} />
        Pay ₹{consultationFees}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400/70">
        <Shield size={12} />
        All transactions are encrypted and secure
      </div>
    </div>
  );
};

export default PaymentGatewaySelect;
