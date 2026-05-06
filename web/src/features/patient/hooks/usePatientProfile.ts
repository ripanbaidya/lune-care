import {useQueryClient} from '@tanstack/react-query';
import {useAppQuery} from '../../../shared/hooks/useAppQuery';
import {useAppMutation} from '../../../shared/hooks/useAppMutation';
import {patientService} from '../patientService';
import type {PatientProfileResponse, UpdateProfileRequest} from '../patient.types';
import type {ResponseWrapper} from '../../../types/api.types';

export const PROFILE_QUERY_KEY = ['patient', 'profile'] as const;

// Fetch Profile
export function usePatientProfile() {
    return useAppQuery<ResponseWrapper<PatientProfileResponse>>({
        queryKey: PROFILE_QUERY_KEY,
        queryFn: () => patientService.getProfile(),
    });
}

// Update Profile
export function useUpdateProfile() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<PatientProfileResponse>, UpdateProfileRequest>({
        mutationFn: (data) => patientService.updateProfile(data),
        onSuccess: (res) => {
            qc.setQueryData(PROFILE_QUERY_KEY, res);
        },
    });
}

// Upload Photo
export function useUploadProfilePhoto() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<PatientProfileResponse>, File>({
        mutationFn: (file) => patientService.uploadProfilePhoto(file),
        onSuccess: (res) => {
            qc.setQueryData(PROFILE_QUERY_KEY, res);
        },
    });
}

// Remove Photo
export function useRemoveProfilePhoto() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<PatientProfileResponse>, void>({
        mutationFn: () => patientService.removeProfilePhoto(),
        onSuccess: (res) => {
            qc.setQueryData(PROFILE_QUERY_KEY, res);
        },
    });
}