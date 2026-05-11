export type AppointmentStatus =
    | 'PENDING_PAYMENT'
    | 'CONFIRMED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';

export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'LOCKED';

// Slot response (used for available slots)
export interface SlotResponse {
    id: string;
    doctorId: string;
    clinicId: string;
    slotDate: string;
    startTime: string;
    endTime: string;
    status: SlotStatus;
}

// Appointment response (used in history / today's list)
export interface AppointmentResponse {
    id: string;
    slotId: string;
    doctorId: string;
    patientId: string;
    clinicId: string;
    slotDate?: string;
    appointmentDate?: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    cancellationReason: string | null;
    createdAt: string;
}

export interface AppointmentPage {
    content: AppointmentResponse[];
    page: {
        number: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
    PENDING_PAYMENT: 'Pending Payment',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'No Show',
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
    PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    NO_SHOW: 'bg-gray-100 text-gray-600',
};
