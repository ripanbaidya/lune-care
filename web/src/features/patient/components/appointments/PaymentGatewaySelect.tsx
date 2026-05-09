import React from "react";
import { BadgeCheck, CreditCard, LockKeyhole, Shield, Wallet } from "lucide-react";
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold text-gray-300/80 uppercase tracking-[0.18em]">
          Select payment gateway
        </p>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
          <BadgeCheck size={11} />
          PCI DSS Compliant
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(["RAZORPAY", "STRIPE"] as GatewayType[]).map((gw) => (
          <button
            key={gw}
            onClick={() => onGatewayChange(gw)}
            className={[
              "relative overflow-hidden flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border text-sm font-semibold transition-all duration-200",
              selectedGateway === gw
                ? "border-blue-500/60 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 backdrop-blur-md shadow-[0_10px_24px_rgba(37,99,235,0.16)]"
                : "border-white/10 bg-gray-900/40 backdrop-blur-md hover:border-blue-400/30 hover:bg-blue-500/10",
            ].join(" ")}
          >
            {selectedGateway === gw ? (
              <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-400/20 blur-xl" />
            ) : null}
            <span>
              {gw === "RAZORPAY" ? (
                <CreditCard className="text-blue-200" size={20} />
              ) : (
                <Wallet className="text-blue-200" size={20} />
              )}
            </span>
            <span
              className={
                selectedGateway === gw
                  ? "text-blue-200 text-base"
                  : "text-gray-300 text-base"
              }
            >
              {gw === "RAZORPAY" ? "Razorpay" : "Stripe"}
            </span>
            {selectedGateway === gw && (
              <span className="text-xs text-blue-300 font-medium">
                ✓ Selected
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/70 to-black/70 px-3.5 py-2.5 text-xs text-gray-300/90">
        {selectedGateway === "RAZORPAY"
          ? "Razorpay supports UPI, Net Banking, cards, and wallets with optimized local success rates."
          : "Stripe supports major international cards with enterprise-grade fraud and compliance controls."}
      </div>

      <button
        onClick={onPay}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-xl hover:from-blue-500 hover:via-blue-400 hover:to-indigo-400 disabled:opacity-60 transition-all duration-200 shadow-[0_12px_26px_rgba(37,99,235,0.24)]"
      >
        <CreditCard size={15} />
        {isLoading ? "Preparing secure checkout..." : `Pay ₹${consultationFees}`}
      </button>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400/70">
        <span className="inline-flex items-center gap-1.5">
          <Shield size={12} />
          Encrypted transaction
        </span>
        <span className="inline-flex items-center gap-1.5">
          <LockKeyhole size={12} />
          Secure checkout
        </span>
      </div>
    </div>
  );
};

export default PaymentGatewaySelect;
