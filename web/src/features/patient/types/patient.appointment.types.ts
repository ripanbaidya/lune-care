export type AppointmentStatus =
    | 'PENDING_PAYMENT'
    | 'CONFIRMED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';

export type CancelledBy = 'PATIENT' | 'DOCTOR';

export interface AppointmentResponse {
    id: string;
    patientId: string;
    doctorId: string;
    clinicId: string;
    slotId: string;
    appointmentDate: string;       // "YYYY-MM-DD"
    startTime: string;             // "HH:mm:ss"
    endTime: string;               // "HH:mm:ss"
    status: AppointmentStatus;
    consultationFees: number;
    paymentId: string | null;
    cancellationReason: string | null;
    cancelledBy: CancelledBy | null;
}

export interface SlotResponse {
    id: string;
    doctorId: string;
    clinicId: string;
    slotDate: string;
    startTime: string;
    endTime: string;
    status: 'AVAILABLE' | 'LOCKED' | 'BOOKED' | 'CANCELLED';
}

export interface BookAppointmentRequest {
    slotId: string;
}

export interface CancelAppointmentRequest {
    reason: string;
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

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
    PENDING_PAYMENT: 'Pending Payment',
    CONFIRMED: 'Confirmed',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'No Show',
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
    PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    NO_SHOW: 'bg-gray-100 text-gray-600',
};