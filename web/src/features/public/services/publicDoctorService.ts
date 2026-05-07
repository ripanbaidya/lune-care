import {apiClient} from '../../../lib/axios';
import type {ResponseWrapper} from '../../../types/api.types';
import type {DoctorSearchFilters, DoctorSearchResponse, PublicDoctorSummary} from '../types/public.types';

export const publicDoctorService = {
    searchDoctors: async (filters: DoctorSearchFilters): Promise<ResponseWrapper<DoctorSearchResponse>> => {
        // Strip undefined/empty/zero values so the API gets clean params
        const params = Object.fromEntries(
            Object.entries(filters).filter(([, v]) => v !== undefined && v !== '' && v !== 0),
        );
        const res = await apiClient.get<ResponseWrapper<DoctorSearchResponse>>('/doctor/search', {params});
        return res.data;
    },

    getDoctorPublic: async (doctorId: string): Promise<ResponseWrapper<PublicDoctorSummary>> => {
        const res = await apiClient.get<ResponseWrapper<PublicDoctorSummary>>(`/doctor/${doctorId}/public`);
        return res.data;
    },
};