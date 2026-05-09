import React, { useEffect, useRef, useState } from "react";
import { CreditCard, Loader2, Shield } from "lucide-react";
import Spinner from "../../../../shared/components/ui/Spinner";

// Stripe types
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
  on: (
    event: string,
    handler: (e: { error?: { message: string } }) => void,
  ) => void;
}

declare global {
  interface Window {
    Stripe: (key: string) => StripeInstance;
  }
}

const loadScript = (src: string): Promise<boolean> =>
  new Promise((resolve) => {
    if (typeof window.Stripe === "function") return resolve(true);
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

interface StripeCardFormProps {
  clientSecret: string;
  stripeKey: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (msg: string) => void;
  onCancel: () => void;
  amount: number;
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
      const ok = await loadScript("https://js.stripe.com/v3/");
      if (!ok || !mounted || !cardRef.current) return;

      if (!stripeKey) {
        console.error("Stripe publishable key is missing");
        return;
      }

      try {
        const stripe = window.Stripe(stripeKey);
        stripeRef.current = stripe;
        const elements = stripe.elements();
        const card = elements.create("card", {
          style: {
            base: {
              fontSize: "14px",
              color: "#f3f4f6",
              fontFamily: "system-ui, sans-serif",
              "::placeholder": { color: "#6b7280" },
            },
            invalid: { color: "#ef4444" },
          },
          hidePostalCode: true,
        });

        cardElementRef.current = card;
        card.mount(cardRef.current);
        card.on("change", (e) => {
          setCardError(e.error?.message ?? null);
        });
        card.on("ready", () => {
          if (mounted) setReady(true);
        });
      } catch (e) {
        console.error("Failed to initialize Stripe:", e);
      }
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

    const { paymentIntent, error } = await stripeRef.current.confirmCardPayment(
      clientSecret,
      { payment_method: { card: cardElementRef.current } },
    );

    setProcessing(false);
    if (error) {
      setCardError(error.message ?? "Payment failed.");
      onError(error.message ?? "Payment failed.");
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
      onError("Payment was not completed. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border border-white/10 rounded-xl bg-gray-900/40 backdrop-blur-md min-h-[52px] hover:border-white/20 transition-colors">
        {!ready && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 size={14} className="animate-spin" />
            Loading card input...
          </div>
        )}
        <div ref={cardRef} />
      </div>

      {cardError && (
        <p className="text-xs text-red-400/80 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
          {cardError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={processing}
          className="flex-1 py-3 border border-white/10 text-sm font-medium rounded-lg text-gray-300 hover:bg-white/5 hover:border-white/20 disabled:opacity-50 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handlePay}
          disabled={!ready || processing}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all duration-200 shadow-lg"
        >
          {processing ? (
            <>
              <Spinner size="sm" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={14} />
              Pay ₹{(amount / 100).toFixed(2)}
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400/70">
        <Shield size={12} />
        Secured by Stripe · 256-bit SSL
      </div>
    </div>
  );
};

export default StripeCardForm;
