export type GatewayType = 'RAZORPAY' | 'STRIPE';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface InitiatePaymentRequest {
    appointmentId: string;
    gatewayType: GatewayType;
}

// What backend returns after initiating Razorpay payment
export interface RazorpayInitiateResponse {
    appointmentId: string;
    gatewayType: 'RAZORPAY';
    razorpayOrderId: string;
    amount: number;    // in paise (e.g. 50000 = ₹500)
    currency: string;  // "INR"
    razorpayKey: string;
}

export interface VerifyRazorpayRequest {
    appointmentId: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
}

export interface PaymentResponse {
    id: string;
    appointmentId: string;
    patientId: string;
    amount: number;
    currency: string;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    status: PaymentStatus;
    gateway: GatewayType;
    createdAt: string;
}