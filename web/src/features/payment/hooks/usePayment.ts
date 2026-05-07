import {useQueryClient} from '@tanstack/react-query';
import {useAppMutation} from '../../../shared/hooks/useAppMutation';
import {useAppQuery} from '../../../shared/hooks/useAppQuery';
import {paymentService} from '../services/paymentService';
import type {
    InitiatePaymentRequest,
    PaymentResponse,
    RazorpayInitiateResponse,
    VerifyRazorpayRequest,
} from '../types/payment.types';
import type {ResponseWrapper} from '../../../types/api.types';
import {PATIENT_APPOINTMENT_HISTORY_KEY} from '../../patient/hooks/usePatientAppointments.ts';

export function useInitiatePayment() {
    return useAppMutation<ResponseWrapper<RazorpayInitiateResponse>, InitiatePaymentRequest>({
        mutationFn: (data) => paymentService.initiatePayment(data),
    });
}

export function useVerifyRazorpay() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<PaymentResponse>, VerifyRazorpayRequest>({
        mutationFn: (data) => paymentService.verifyRazorpay(data),
        onSuccess: (_res, {appointmentId}) => {
            // Refresh appointment history + specific appointment detail
            qc.invalidateQueries({queryKey: PATIENT_APPOINTMENT_HISTORY_KEY});
            qc.invalidateQueries({queryKey: ['patient', 'appointment', appointmentId]});
        },
    });
}

export function usePaymentForAppointment(appointmentId: string) {
    return useAppQuery<ResponseWrapper<PaymentResponse>>({
        queryKey: ['payment', 'appointment', appointmentId],
        queryFn: () => paymentService.getPaymentForAppointment(appointmentId),
        enabled: !!appointmentId,
    });
}