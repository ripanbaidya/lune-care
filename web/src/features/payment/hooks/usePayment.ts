import {useQueryClient} from '@tanstack/react-query';
import {useAppMutation} from '../../../shared/hooks/useAppMutation';
import {useAppQuery} from '../../../shared/hooks/useAppQuery';
import {paymentService} from '../services/paymentService';
import type {
    InitiatePaymentRequest,
    PaymentPage,
    PaymentResponse,
    RazorpayInitiateResponse,
    StripeInitiateResponse,
    VerifyRazorpayRequest,
    VerifyStripeRequest,
} from '../types/payment.types';
import type {ResponseWrapper} from '../../../types/api.types';
import {PATIENT_APPOINTMENT_HISTORY_KEY} from '../../patient/hooks/usePatientAppointments';

// Initiate payment
export function useInitiateRazorpay() {
    return useAppMutation<ResponseWrapper<RazorpayInitiateResponse>, InitiatePaymentRequest>({
        mutationFn: (data) => paymentService.initiateRazorpay(data),
    });
}

export function useInitiateStripe() {
    return useAppMutation<ResponseWrapper<StripeInitiateResponse>, InitiatePaymentRequest>({
        mutationFn: (data) => paymentService.initiateStripe(data),
    });
}

// Verify payment

export function useVerifyRazorpay() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<PaymentResponse>, VerifyRazorpayRequest>({
        mutationFn: (data) => paymentService.verifyRazorpay(data),
        onSuccess: (_res, {appointmentId}) => {
            qc.invalidateQueries({queryKey: PATIENT_APPOINTMENT_HISTORY_KEY});
            qc.invalidateQueries({queryKey: ['patient', 'appointment', appointmentId]});
            qc.invalidateQueries({queryKey: ['payment', 'history']});
        },
    });
}

export function useVerifyStripe() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<PaymentResponse>, VerifyStripeRequest>({
        mutationFn: (data) => paymentService.verifyStripe(data),
        onSuccess: (_res, {appointmentId}) => {
            qc.invalidateQueries({queryKey: PATIENT_APPOINTMENT_HISTORY_KEY});
            qc.invalidateQueries({queryKey: ['patient', 'appointment', appointmentId]});
            qc.invalidateQueries({queryKey: ['payment', 'history']});
        },
    });
}

// History / Lookup

export function usePaymentHistory(page = 0, size = 10) {
    return useAppQuery<ResponseWrapper<PaymentPage>>({
        queryKey: ['payment', 'history', page, size],
        queryFn: () => paymentService.getPaymentHistory(page, size),
    });
}

export function usePaymentForAppointment(appointmentId: string) {
    return useAppQuery<ResponseWrapper<PaymentResponse>>({
        queryKey: ['payment', 'appointment', appointmentId],
        queryFn: () => paymentService.getPaymentForAppointment(appointmentId),
        enabled: !!appointmentId,
    });
}