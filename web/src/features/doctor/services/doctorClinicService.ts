import {apiClient} from '../../../lib/axios';
import type {ResponseWrapper} from '../../../types/api.types';
import type {
    ClinicResponse,
    CreateClinicRequest,
    UpdateClinicRequest,
    ClinicScheduleResponse,
    ClinicScheduleRequest,
} from '../types/doctor-clinic.types';

export const doctorService = {

    // Clinics
    getClinics: async (): Promise<ResponseWrapper<ClinicResponse[]>> => {
        const res = await apiClient.get<ResponseWrapper<ClinicResponse[]>>('/doctor/clinics');
        return res.data;
    },

    addClinic: async (data: CreateClinicRequest): Promise<ResponseWrapper<ClinicResponse>> => {
        const res = await apiClient.post<ResponseWrapper<ClinicResponse>>('/doctor/clinics', data);
        return res.data;
    },

    updateClinic: async (clinicId: string, data: UpdateClinicRequest): Promise<ResponseWrapper<ClinicResponse>> => {
        const res = await apiClient.put<ResponseWrapper<ClinicResponse>>(`/doctor/clinics/${clinicId}`, data);
        return res.data;
    },

    deleteClinic: async (clinicId: string): Promise<void> => {
        await apiClient.delete(`/doctor/clinics/${clinicId}`);
    },

    // Schedule
    getSchedule: async (clinicId: string): Promise<ResponseWrapper<ClinicScheduleResponse[]>> => {
        const res = await apiClient.get<ResponseWrapper<ClinicScheduleResponse[]>>(
            `/doctor/clinics/${clinicId}/schedule`,
        );
        return res.data;
    },

    setSchedule: async (clinicId: string, data: ClinicScheduleRequest): Promise<ResponseWrapper<ClinicScheduleResponse[]>> => {
        const res = await apiClient.post<ResponseWrapper<ClinicScheduleResponse[]>>(
            `/doctor/clinics/${clinicId}/schedule`,
            data,
        );
        return res.data;
    },

    updateSchedule: async (clinicId: string, data: ClinicScheduleRequest): Promise<ResponseWrapper<ClinicScheduleResponse[]>> => {
        const res = await apiClient.put<ResponseWrapper<ClinicScheduleResponse[]>>(
            `/doctor/clinics/${clinicId}/schedule`,
            data,
        );
        return res.data;
    },

    deleteScheduleDay: async (clinicId: string, dayOfWeek: string): Promise<void> => {
        await apiClient.delete(`/doctor/clinics/${clinicId}/schedule/${dayOfWeek}`);
    },
};