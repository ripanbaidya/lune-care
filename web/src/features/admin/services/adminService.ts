import { apiClient } from '../../../lib/axios';
import type { ResponseWrapper } from '../../../types/api.types';
import type { OverviewResponse, PendingDoctorResponse } from '../types/admin.types';

export const adminService = {
    getPendingDoctors: async (): Promise<ResponseWrapper<PendingDoctorResponse[]>> => {
        const res = await apiClient.get<ResponseWrapper<PendingDoctorResponse[]>>(
            '/admin/doctors/pending',
        );
        return res.data;
    },

    verifyDoctor: async (doctorId: string): Promise<void> => {
        await apiClient.patch(`/admin/doctors/${doctorId}/verify`);
    },

    rejectDoctor: async (doctorId: string, reason: string): Promise<void> => {
        await apiClient.patch(`/admin/doctors/${doctorId}/reject`, { reason });
    },

    getOverview: async (): Promise<ResponseWrapper<OverviewResponse>> => {
        const res = await apiClient.get<ResponseWrapper<OverviewResponse>>(
            '/admin/analytics/overview',
        );
        return res.data;
    },
};