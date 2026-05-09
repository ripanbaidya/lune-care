import {apiClient} from '../../../lib/axios';
import type {ResponseWrapper} from '../../../types/api.types';
import type {
    DoctorProfileResponse,
    UpdateDoctorProfileRequest,
    OnboardingRequest,
    DoctorDocumentResponse,
    DocumentType,
} from '../types/doctor.types';

export const doctorService = {
    // Profile
    getProfile: async (): Promise<ResponseWrapper<DoctorProfileResponse>> => {
        const res = await apiClient.get<ResponseWrapper<DoctorProfileResponse>>('/doctor/profile');
        return res.data;
    },

    updateProfile: async (data: UpdateDoctorProfileRequest): Promise<ResponseWrapper<DoctorProfileResponse>> => {
        const res = await apiClient.put<ResponseWrapper<DoctorProfileResponse>>('/doctor/profile', data);
        return res.data;
    },

    uploadProfilePhoto: async (file: File): Promise<ResponseWrapper<DoctorProfileResponse>> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await apiClient.patch<ResponseWrapper<DoctorProfileResponse>>(
            '/doctor/profile/upload-photo',
            formData,
            {headers: {'Content-Type': 'multipart/form-data'}},
        );
        return res.data;
    },

    removeProfilePhoto: async (): Promise<ResponseWrapper<DoctorProfileResponse>> => {
        const res = await apiClient.delete<ResponseWrapper<DoctorProfileResponse>>('/doctor/profile/remove-photo');
        return res.data;
    },

    // Onboarding
    completeOnboarding: async (data: OnboardingRequest): Promise<ResponseWrapper<DoctorProfileResponse>> => {
        const res = await apiClient.post<ResponseWrapper<DoctorProfileResponse>>('/doctor/onboarding/complete', data);
        return res.data;
    },

    uploadDocument: async (documentType: DocumentType, file: File): Promise<ResponseWrapper<DoctorDocumentResponse>> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await apiClient.patch<ResponseWrapper<DoctorDocumentResponse>>(
            `/doctor/documents/upload?documentType=${documentType}`,
            formData,
            {headers: {'Content-Type': 'multipart/form-data'}},
        );
        return res.data;
    },
};