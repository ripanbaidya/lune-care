import {useQueryClient} from '@tanstack/react-query';
import {useAppQuery} from '../../../shared/hooks/useAppQuery';
import {useAppMutation} from '../../../shared/hooks/useAppMutation';
import {doctorService} from '../service/doctorService';
import type {
    DoctorProfileResponse,
    UpdateDoctorProfileRequest,
    OnboardingRequest,
    DocumentType,
    DoctorDocumentResponse
} from '../types/doctor.types';
import type {ResponseWrapper} from '../../../types/api.types';

export const DOCTOR_PROFILE_QUERY_KEY = ['doctor', 'profile'] as const;

export function useDoctorProfile() {
    return useAppQuery<ResponseWrapper<DoctorProfileResponse>>({
        queryKey: DOCTOR_PROFILE_QUERY_KEY,
        queryFn: () => doctorService.getProfile(),
    });
}

export function useUpdateDoctorProfile() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<DoctorProfileResponse>, UpdateDoctorProfileRequest>({
        mutationFn: (data) => doctorService.updateProfile(data),
        onSuccess: (res) => {
            qc.setQueryData(DOCTOR_PROFILE_QUERY_KEY, res);
        },
    });
}

export function useUploadDoctorPhoto() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<DoctorProfileResponse>, File>({
        mutationFn: (file) => doctorService.uploadProfilePhoto(file),
        onSuccess: (res) => {
            qc.setQueryData(DOCTOR_PROFILE_QUERY_KEY, res);
        },
    });
}

export function useRemoveDoctorPhoto() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<DoctorProfileResponse>, void>({
        mutationFn: () => doctorService.removeProfilePhoto(),
        onSuccess: (res) => {
            qc.setQueryData(DOCTOR_PROFILE_QUERY_KEY, res);
        },
    });
}

export function useCompleteOnboarding() {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<DoctorProfileResponse>, OnboardingRequest>({
        mutationFn: (data) => doctorService.completeOnboarding(data),
        onSuccess: (res) => {
            qc.setQueryData(DOCTOR_PROFILE_QUERY_KEY, res);
        },
    });
}

export function useUploadDocument() {
    return useAppMutation<ResponseWrapper<DoctorDocumentResponse>, { documentType: DocumentType; file: File }>({
        mutationFn: ({documentType, file}) => doctorService.uploadDocument(documentType, file),
    });
}