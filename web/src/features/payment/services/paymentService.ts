import {apiClient} from '../../../lib/axios';
import type {ResponseWrapper} from '../../../types/api.types';
import type {
    InitiatePaymentRequest,
    PaymentPage,
    PaymentResponse,
    RazorpayInitiateResponse,
    StripeInitiateResponse,
    VerifyRazorpayRequest,
    VerifyStripeRequest,
} from '../types/payment.types';

export const paymentService = {

    // Initiate
    initiateRazorpay: async (
        data: InitiatePaymentRequest,
    ): Promise<ResponseWrapper<RazorpayInitiateResponse>> => {
        const res = await apiClient.post<ResponseWrapper<RazorpayInitiateResponse>>(
            '/payment/initiate',
            {...data, gatewayType: 'RAZORPAY'},
        );
        return res.data;
    },

    initiateStripe: async (
        data: InitiatePaymentRequest,
    ): Promise<ResponseWrapper<StripeInitiateResponse>> => {
        const res = await apiClient.post<ResponseWrapper<StripeInitiateResponse>>(
            '/payment/initiate',
            {...data, gatewayType: 'STRIPE'},
        );
        return res.data;
    },

    // Verify

    verifyRazorpay: async (
        data: VerifyRazorpayRequest,
    ): Promise<ResponseWrapper<PaymentResponse>> => {
        const res = await apiClient.post<ResponseWrapper<PaymentResponse>>(
            '/payment/verify',
            data,
        );
        return res.data;
    },

    verifyStripe: async (
        data: VerifyStripeRequest,
    ): Promise<ResponseWrapper<PaymentResponse>> => {
        const res = await apiClient.post<ResponseWrapper<PaymentResponse>>(
            '/payment/verify',
            data,
        );
        return res.data;
    },

    // History / Lookup

    getPaymentHistory: async (
        page = 0,
        size = 10,
    ): Promise<ResponseWrapper<PaymentPage>> => {
        const res = await apiClient.get<ResponseWrapper<PaymentPage>>(
            '/payment/history',
            {params: {page, size}},
        );
        return res.data;
    },

    getPaymentForAppointment: async (
        appointmentId: string,
    ): Promise<ResponseWrapper<PaymentResponse>> => {
        const res = await apiClient.get<ResponseWrapper<PaymentResponse>>(
            `/payment/appointment/${appointmentId}`,
        );
        return res.data;
    },
};