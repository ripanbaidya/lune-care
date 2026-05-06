import {useQueryClient} from '@tanstack/react-query';
import {useAppQuery} from '../../../shared/hooks/useAppQuery';
import {useAppMutation} from '../../../shared/hooks/useAppMutation';
import {doctorService} from '../service/doctorClinicService';
import type {
    ClinicResponse,
    CreateClinicRequest,
    UpdateClinicRequest
} from '../types/doctor.clinic.types';
import type {ResponseWrapper} from '../../../types/api.types';

export const DOCTOR_CLINICS_QUERY_KEY = ['doctor', 'clinics'] as const;

export function useDoctorClinics() {
    return useAppQuery<ResponseWrapper<ClinicResponse[]>>({
        queryKey: DOCTOR_CLINICS_QUERY_KEY,
        queryFn: () => doctorService.getClinics(),
    });
}

export function useAddClinic() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<ClinicResponse>, CreateClinicRequest>({
        mutationFn: (data) => doctorService.addClinic(data),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: DOCTOR_CLINICS_QUERY_KEY});
        },
    });
}

export function useUpdateClinic() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<ClinicResponse>, { clinicId: string; data: UpdateClinicRequest }>({
        mutationFn: ({clinicId, data}) => doctorService.updateClinic(clinicId, data),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: DOCTOR_CLINICS_QUERY_KEY});
        },
    });
}

export function useDeleteClinic() {
    const qc = useQueryClient();
    return useAppMutation<void, string>({
        mutationFn: (clinicId) => doctorService.deleteClinic(clinicId),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: DOCTOR_CLINICS_QUERY_KEY});
        },
    });
}