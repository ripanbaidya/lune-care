import {apiClient} from '../../../lib/axios';
import type {ResponseWrapper} from '../../../types/api.types';
import type {AppointmentResponse, AppointmentPage} from '../types/doctor.appointment.types';

export const doctorAppointmentService = {
    // GET /api/appointment/doctor/today
    getTodayAppointments: async (): Promise<ResponseWrapper<AppointmentResponse[]>> => {
        const res = await apiClient.get<ResponseWrapper<AppointmentResponse[]>>(
            '/appointment/doctor/today',
        );
        return res.data;
    },

    // GET /api/appointment/doctor/history
    getAppointmentHistory: async (
        page = 0,
        size = 10,
    ): Promise<ResponseWrapper<AppointmentPage>> => {
        const res = await apiClient.get<ResponseWrapper<AppointmentPage>>(
            '/appointment/doctor/history',
            {params: {page, size}},
        );
        return res.data;
    },

    // GET /api/appointment/:appointmentId
    getAppointmentById: async (
        appointmentId: string,
    ): Promise<ResponseWrapper<AppointmentResponse>> => {
        const res = await apiClient.get<ResponseWrapper<AppointmentResponse>>(
            `/appointment/${appointmentId}`,
        );
        return res.data;
    },

    // PATCH /api/appointment/:appointmentId/complete
    markComplete: async (appointmentId: string): Promise<ResponseWrapper<AppointmentResponse>> => {
        const res = await apiClient.patch<ResponseWrapper<AppointmentResponse>>(
            `/appointment/${appointmentId}/complete`,
        );
        return res.data;
    },

    // PATCH /api/appointment/:appointmentId/no-show
    markNoShow: async (appointmentId: string): Promise<ResponseWrapper<AppointmentResponse>> => {
        const res = await apiClient.patch<ResponseWrapper<AppointmentResponse>>(
            `/appointment/${appointmentId}/no-show`,
        );
        return res.data;
    },

    // PATCH /api/appointment/:appointmentId/cancel
    cancelAppointment: async (
        appointmentId: string,
        reason: string,
    ): Promise<ResponseWrapper<AppointmentResponse>> => {
        const res = await apiClient.patch<ResponseWrapper<AppointmentResponse>>(
            `/appointment/${appointmentId}/cancel`,
            {reason},
        );
        return res.data;
    },
};