import {useQueryClient} from '@tanstack/react-query';
import {useAppQuery} from '../../../shared/hooks/useAppQuery';
import {useAppMutation} from '../../../shared/hooks/useAppMutation';
import {patientService} from '../services/patientService';
import type {PatientProfileResponse, UpdateProfileRequest} from '../types/patient.types';
import type {ResponseWrapper} from '../../../types/api.types';
import {useAuthStore} from '../../../store/authStore';

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
    const {updateUser} = useAuthStore();
    return useAppMutation<ResponseWrapper<PatientProfileResponse>, UpdateProfileRequest>({
        mutationFn: (data) => patientService.updateProfile(data),
        onSuccess: (res) => {
            qc.setQueryData(PROFILE_QUERY_KEY, res);
            updateUser({profilePhotoUrl: res.data.profilePhotoUrl});
        },
    });
}

// Upload Photo
export function useUploadProfilePhoto() {
    const qc = useQueryClient();
    const {updateUser} = useAuthStore();
    return useAppMutation<ResponseWrapper<PatientProfileResponse>, File>({
        mutationFn: (file) => patientService.uploadProfilePhoto(file),
        onSuccess: (res) => {
            qc.setQueryData(PROFILE_QUERY_KEY, res);
            updateUser({profilePhotoUrl: res.data.profilePhotoUrl});
        },
    });
}

// Remove Photo
export function useRemoveProfilePhoto() {
    const qc = useQueryClient();
    const {updateUser} = useAuthStore();
    return useAppMutation<ResponseWrapper<PatientProfileResponse>, void>({
        mutationFn: () => patientService.removeProfilePhoto(),
        onSuccess: (res) => {
            qc.setQueryData(PROFILE_QUERY_KEY, res);
            updateUser({profilePhotoUrl: res.data.profilePhotoUrl});
        },
    });
}
