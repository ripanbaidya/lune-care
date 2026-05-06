import {useQueryClient} from '@tanstack/react-query';
import {useAppQuery} from '../../../shared/hooks/useAppQuery';
import {useAppMutation} from '../../../shared/hooks/useAppMutation';
import {doctorAppointmentService} from '../service/doctorAppointmentService';
import type {AppointmentResponse, AppointmentPage} from '../types/doctor.appointment.types';
import type {ResponseWrapper} from '../../../types/api.types';

export const DOCTOR_TODAY_APPOINTMENTS_KEY = ['doctor', 'appointments', 'today'] as const;
export const DOCTOR_APPOINTMENT_HISTORY_KEY = ['doctor', 'appointments', 'history'] as const;

export function useDoctorTodayAppointments() {
    return useAppQuery<ResponseWrapper<AppointmentResponse[]>>({
        queryKey: DOCTOR_TODAY_APPOINTMENTS_KEY,
        queryFn: () => doctorAppointmentService.getTodayAppointments(),
        // Refetch every 60s — appointments are time-sensitive
        refetchInterval: 60_000,
    });
}

export function useDoctorAppointmentHistory(page = 0, size = 10) {
    return useAppQuery<ResponseWrapper<AppointmentPage>>({
        queryKey: [...DOCTOR_APPOINTMENT_HISTORY_KEY, page, size],
        queryFn: () => doctorAppointmentService.getAppointmentHistory(page, size),
    });
}

export function useMarkAppointmentComplete() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<AppointmentResponse>, string>({
        mutationFn: (appointmentId) => doctorAppointmentService.markComplete(appointmentId),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: DOCTOR_TODAY_APPOINTMENTS_KEY});
            qc.invalidateQueries({queryKey: DOCTOR_APPOINTMENT_HISTORY_KEY});
        },
    });
}

export function useMarkNoShow() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<AppointmentResponse>, string>({
        mutationFn: (appointmentId) => doctorAppointmentService.markNoShow(appointmentId),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: DOCTOR_TODAY_APPOINTMENTS_KEY});
            qc.invalidateQueries({queryKey: DOCTOR_APPOINTMENT_HISTORY_KEY});
        },
    });
}

export function useCancelAppointment() {
    const qc = useQueryClient();
    return useAppMutation<
        ResponseWrapper<AppointmentResponse>,
        { appointmentId: string; reason: string }
    >({
        mutationFn: ({appointmentId, reason}) =>
            doctorAppointmentService.cancelAppointment(appointmentId, reason),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: DOCTOR_TODAY_APPOINTMENTS_KEY});
            qc.invalidateQueries({queryKey: DOCTOR_APPOINTMENT_HISTORY_KEY});
        },
    });
}