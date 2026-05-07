import {apiClient} from '../../../lib/axios.ts';
import type {ResponseWrapper} from '../../../types/api.types.ts';
import type {
    PatientProfileResponse,
    UpdateProfileRequest,
} from '../types/patient.types.ts';

export const patientService = {
    getProfile: async (): Promise<ResponseWrapper<PatientProfileResponse>> => {
        const res = await apiClient.get<ResponseWrapper<PatientProfileResponse>>('/patient/profile');
        return res.data;
    },

    updateProfile: async (
        data: UpdateProfileRequest,
    ): Promise<ResponseWrapper<PatientProfileResponse>> => {
        const res = await apiClient.put<ResponseWrapper<PatientProfileResponse>>(
            '/patient/profile',
            data,
        );
        return res.data;
    },

    uploadProfilePhoto: async (
        file: File,
    ): Promise<ResponseWrapper<PatientProfileResponse>> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await apiClient.patch<ResponseWrapper<PatientProfileResponse>>(
            '/patient/profile/upload-photo',
            formData,
            {headers: {'Content-Type': 'multipart/form-data'}},
        );
        return res.data;
    },

    removeProfilePhoto: async (): Promise<ResponseWrapper<PatientProfileResponse>> => {
        const res = await apiClient.delete<ResponseWrapper<PatientProfileResponse>>(
            '/patient/profile/remove-photo',
        );
        return res.data;
    },
};