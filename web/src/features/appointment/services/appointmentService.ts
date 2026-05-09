import {apiClient} from '../../../lib/axios';
import type {ResponseWrapper} from '../../../types/api.types';
import type {SlotResponse} from '../../doctor/types/doctor-appointment.types';

export interface AppointmentBookingResponse {
    id: string;
    slotId: string;
    doctorId: string;
    patientId: string;
    clinicId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: string;
    consultationFees: number;
    paymentId: string | null;
    createdAt: string;
    cancellationReason: string | null;
}

export interface AppointmentPage {
    content: AppointmentBookingResponse[];
    page: { number: number; size: number; totalElements: number; totalPages: number };
}

export const appointmentService = {
    // GET /api/appointment/slots/:doctorId/:clinicId?date=YYYY-MM-DD
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

    bookAppointment: async (slotId: string): Promise<ResponseWrapper<AppointmentBookingResponse>> => {
        const res = await apiClient.post<ResponseWrapper<AppointmentBookingResponse>>(
            '/appointment/book',
            {slotId},
        );
        return res.data;
    },

    getAppointmentById: async (
        appointmentId: string,
    ): Promise<ResponseWrapper<AppointmentBookingResponse>> => {
        const res = await apiClient.get<ResponseWrapper<AppointmentBookingResponse>>(
            `/appointment/${appointmentId}`,
        );
        return res.data;
    },

    getPatientHistory: async (page = 0, size = 10): Promise<ResponseWrapper<AppointmentPage>> => {
        const res = await apiClient.get<ResponseWrapper<AppointmentPage>>(
            '/appointment/patient/history',
            {params: {page, size}},
        );
        return res.data;
    },

    cancelAppointment: async (
        appointmentId: string,
        reason: string,
    ): Promise<ResponseWrapper<AppointmentBookingResponse>> => {
        const res = await apiClient.patch<ResponseWrapper<AppointmentBookingResponse>>(
            `/appointment/${appointmentId}/cancel`,
            {reason},
        );
        return res.data;
    },
};