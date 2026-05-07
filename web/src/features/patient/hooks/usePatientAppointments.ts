import {useQueryClient} from '@tanstack/react-query';
import {useAppQuery} from '../../../shared/hooks/useAppQuery.ts';
import {useAppMutation} from '../../../shared/hooks/useAppMutation.ts';
import {patientAppointmentService} from '../services/patientAppointmentService.ts';
import type {
    AppointmentPage,
    AppointmentResponse,
    BookAppointmentRequest,
    CancelAppointmentRequest,
    SlotResponse,
} from '../types/patient.appointment.types.ts';
import type {ResponseWrapper} from '../../../types/api.types.ts';

export const PATIENT_APPOINTMENT_HISTORY_KEY = ['patient', 'appointments', 'history'] as const;

export function useAvailableSlots(
    doctorId: string,
    clinicId: string,
    date: string,
    enabled = true,
) {
    return useAppQuery<ResponseWrapper<SlotResponse[]>>({
        queryKey: ['appointment', 'slots', doctorId, clinicId, date],
        queryFn: () => patientAppointmentService.getAvailableSlots(doctorId, clinicId, date),
        enabled: enabled && !!doctorId && !!clinicId && !!date,
        // Don't cache slots — always fetch fresh so availability is accurate
        staleTime: 0,
    });
}

export function useAppointment(appointmentId: string) {
    return useAppQuery<ResponseWrapper<AppointmentResponse>>({
        queryKey: ['patient', 'appointment', appointmentId],
        queryFn: () => patientAppointmentService.getAppointment(appointmentId),
        enabled: !!appointmentId,
    });
}

export function usePatientAppointmentHistory(page = 0, size = 10) {
    return useAppQuery<ResponseWrapper<AppointmentPage>>({
        queryKey: [...PATIENT_APPOINTMENT_HISTORY_KEY, page, size],
        queryFn: () => patientAppointmentService.getHistory(page, size),
    });
}

export function useBookAppointment() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<AppointmentResponse>, BookAppointmentRequest>({
        mutationFn: (data) => patientAppointmentService.bookAppointment(data),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: PATIENT_APPOINTMENT_HISTORY_KEY});
        },
    });
}

export function useCancelPatientAppointment() {
    const qc = useQueryClient();
    return useAppMutation<
        ResponseWrapper<AppointmentResponse>,
        {appointmentId: string; data: CancelAppointmentRequest}
    >({
        mutationFn: ({appointmentId, data}) =>
            patientAppointmentService.cancelAppointment(appointmentId, data),
        onSuccess: (_res, {appointmentId}) => {
            qc.invalidateQueries({queryKey: PATIENT_APPOINTMENT_HISTORY_KEY});
            qc.invalidateQueries({queryKey: ['patient', 'appointment', appointmentId]});
        },
    });
}