import {useQueryClient} from '@tanstack/react-query';
import {useAppQuery} from '../../../shared/hooks/useAppQuery';
import {useAppMutation} from '../../../shared/hooks/useAppMutation';
import {appointmentService} from '../../appointment/services/appointmentService';
import type {ResponseWrapper} from '../../../types/api.types';
import type {SlotResponse} from '../../doctor/types/doctor.appointment.types';
import type {AppointmentBookingResponse, AppointmentPage} from '../../appointment/services/appointmentService';
import {AppError} from '../../../shared/utils/errorParser';

export const PATIENT_HISTORY_KEY = ['patient', 'appointments', 'history'] as const;

// Key includes doctorId + clinicId + date so different combos cache independently
export function slotsQueryKey(doctorId: string, clinicId: string, date: string) {
    return ['appointment', 'slots', doctorId, clinicId, date] as const;
}

export function useAvailableSlots(
    doctorId: string | undefined,
    clinicId: string | undefined,
    date: string | undefined,
) {
    return useAppQuery<ResponseWrapper<SlotResponse[]>>({
        queryKey: slotsQueryKey(doctorId ?? '', clinicId ?? '', date ?? ''),
        queryFn: () => appointmentService.getAvailableSlots(doctorId!, clinicId!, date!),
        // Only fetch when all three are present
        enabled: !!doctorId && !!clinicId && !!date,
        staleTime: 30_000, // slots are time-sensitive, 30s cache
        retry: (failureCount, error) => {
            if (error instanceof AppError && !error.isServerError) return false;
            return failureCount < 1;
        },
    });
}

export function useBookAppointment() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<AppointmentBookingResponse>, string>({
        mutationFn: (slotId) => appointmentService.bookAppointment(slotId),
        onSuccess: () => {
            // Invalidate history so it refreshes
            qc.invalidateQueries({queryKey: PATIENT_HISTORY_KEY});
        },
    });
}

export function usePatientAppointmentHistory(page = 0, size = 10) {
    return useAppQuery<ResponseWrapper<AppointmentPage>>({
        queryKey: [...PATIENT_HISTORY_KEY, page, size],
        queryFn: () => appointmentService.getPatientHistory(page, size),
    });
}

export function useCancelPatientAppointment() {
    const qc = useQueryClient();
    return useAppMutation<
        ResponseWrapper<AppointmentBookingResponse>,
        { appointmentId: string; reason: string }
    >({
        mutationFn: ({appointmentId, reason}) =>
            appointmentService.cancelAppointment(appointmentId, reason),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: PATIENT_HISTORY_KEY});
        },
    });
}