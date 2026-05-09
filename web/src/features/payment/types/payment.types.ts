export type GatewayType = 'RAZORPAY' | 'STRIPE';
export type PaymentStatus = 'INITIATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'REFUND_FAILED';

export interface InitiatePaymentRequest {
    appointmentId: string;
    gatewayType: GatewayType;
}

// Razorpay

export interface RazorpayInitiateResponse {
    id: string;
    appointmentId: string;
    patientId: string;
    amount: number;
    currency: string;
    gateway: 'RAZORPAY';
    status: PaymentStatus;
    createdAt: string;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    
    // Razorpay publishable key - injected by service layer
    razorpayKey: string;
}

export interface VerifyRazorpayRequest {
    appointmentId: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
}

// Stripe

export interface StripeInitiateResponse {
    id: string;
    appointmentId: string;
    patientId: string;
    amount: number;
    currency: string;
    gateway: 'STRIPE';
    status: PaymentStatus;
    createdAt: string;
    stripePaymentIntentId: string;
    clientSecret: string; // only present in initiate response
}

export interface VerifyStripeRequest {
    appointmentId: string;
    stripePaymentIntentId: string;
}

// Generic payment record

export interface PaymentResponse {
    id: string;
    appointmentId: string;
    patientId: string;
    amount: number;
    currency: string;
    gateway: GatewayType;
    status: PaymentStatus;
    createdAt: string;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    stripePaymentIntentId: string | null;
    clientSecret: string | null;
}

export interface PaymentPage {
    content: PaymentResponse[];
    page: {
        number: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    INITIATED: 'Initiated',
    SUCCESS: 'Success',
    FAILED: 'Failed',
    REFUNDED: 'Refunded',
    REFUND_FAILED: 'Refund Failed'
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
    INITIATED: 'bg-amber-100 text-amber-700',
    SUCCESS: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-blue-100 text-blue-700',
    REFUND_FAILED: 'bg-red-100 text-red-500'
};