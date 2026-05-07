import {apiClient} from '../../../lib/axios.ts';
import type {ResponseWrapper} from '../../../types/api.types.ts';
import type {
    AppointmentPage,
    AppointmentResponse,
    BookAppointmentRequest,
    CancelAppointmentRequest,
    SlotResponse,
} from '../types/patient.appointment.types.ts';

export const patientAppointmentService = {
    getAvailableSlots: async (
        doctorId: string,
        clinicId: string,
        date: string,
    ): Promise<ResponseWrapper<SlotResponse[]>> => {
        const res = await apiClient.get<ResponseWrapper<SlotResponse[]>>(
            `/appointment/slots/${doctorId}/${clinicId}`,
            {params: {date}},
        );
        return res.data;
    },

    bookAppointment: async (
        data: BookAppointmentRequest,
    ): Promise<ResponseWrapper<AppointmentResponse>> => {
        const res = await apiClient.post<ResponseWrapper<AppointmentResponse>>('/appointment/book', data);
        return res.data;
    },

    getAppointment: async (appointmentId: string): Promise<ResponseWrapper<AppointmentResponse>> => {
        const res = await apiClient.get<ResponseWrapper<AppointmentResponse>>(
            `/appointment/${appointmentId}`,
        );
        return res.data;
    },

    getHistory: async (page = 0, size = 10): Promise<ResponseWrapper<AppointmentPage>> => {
        const res = await apiClient.get<ResponseWrapper<AppointmentPage>>(
            '/appointment/patient/history',
            {params: {page, size}},
        );
        return res.data;
    },

    cancelAppointment: async (
        appointmentId: string,
        data: CancelAppointmentRequest,
    ): Promise<ResponseWrapper<AppointmentResponse>> => {
        const res = await apiClient.patch<ResponseWrapper<AppointmentResponse>>(
            `/appointment/${appointmentId}/cancel`,
            data,
            // Backend reads X-User-Role to determine CancelledBy
            {headers: {'X-User-Role': 'ROLE_PATIENT'}},
        );
        return res.data;
    },
};