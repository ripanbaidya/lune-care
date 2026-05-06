import {useQueryClient} from '@tanstack/react-query';
import {useAppQuery} from '../../../shared/hooks/useAppQuery';
import {useAppMutation} from '../../../shared/hooks/useAppMutation';
import {doctorService} from '../service/doctorClinicService';
import type {ClinicScheduleResponse, ClinicScheduleRequest} from '../types/doctor.clinic.types';
import type {ResponseWrapper} from '../../../types/api.types';
import {DOCTOR_CLINICS_QUERY_KEY} from './useDoctorClinics';

export function scheduleQueryKey(clinicId: string) {
    return ['doctor', 'clinics', clinicId, 'schedule'] as const;
}

export function useDoctorSchedule(clinicId: string) {
    return useAppQuery<ResponseWrapper<ClinicScheduleResponse[]>>({
        queryKey: scheduleQueryKey(clinicId),
        queryFn: () => doctorService.getSchedule(clinicId),
        enabled: !!clinicId,
    });
}

export function useSetSchedule(clinicId: string) {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<ClinicScheduleResponse[]>, ClinicScheduleRequest>({
        mutationFn: (data) => doctorService.setSchedule(clinicId, data),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: scheduleQueryKey(clinicId)});
            // Also refresh clinics so embedded schedules on clinic card update
            qc.invalidateQueries({queryKey: DOCTOR_CLINICS_QUERY_KEY});
        },
    });
}

export function useUpdateSchedule(clinicId: string) {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<ClinicScheduleResponse[]>, ClinicScheduleRequest>({
        mutationFn: (data) => doctorService.updateSchedule(clinicId, data),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: scheduleQueryKey(clinicId)});
            qc.invalidateQueries({queryKey: DOCTOR_CLINICS_QUERY_KEY});
        },
    });
}

export function useDeleteScheduleDay(clinicId: string) {
    const qc = useQueryClient();
    return useAppMutation<void, string>({
        mutationFn: (dayOfWeek) => doctorService.deleteScheduleDay(clinicId, dayOfWeek),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: scheduleQueryKey(clinicId)});
            qc.invalidateQueries({queryKey: DOCTOR_CLINICS_QUERY_KEY});
        },
    });
}