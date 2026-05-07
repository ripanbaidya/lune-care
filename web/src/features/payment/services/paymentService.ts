import {apiClient} from '../../../lib/axios';
import type {ResponseWrapper} from '../../../types/api.types';
import type {
    InitiatePaymentRequest,
    PaymentResponse,
    RazorpayInitiateResponse,
    VerifyRazorpayRequest,
} from '../types/payment.types';

export const paymentService = {
    initiatePayment: async (
        data: InitiatePaymentRequest,
    ): Promise<ResponseWrapper<RazorpayInitiateResponse>> => {
        const res = await apiClient.post<ResponseWrapper<RazorpayInitiateResponse>>(
            '/payment/initiate',
            data,
        );
        return res.data;
    },

    verifyRazorpay: async (
        data: VerifyRazorpayRequest,
    ): Promise<ResponseWrapper<PaymentResponse>> => {
        const res = await apiClient.post<ResponseWrapper<PaymentResponse>>('/payment/verify', data);
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