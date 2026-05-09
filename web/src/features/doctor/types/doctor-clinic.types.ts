export type ClinicType = 'IN_PERSON' | 'ONLINE' | 'PRIVATE_CLINIC' | 'HOSPITAL' | 'CLINIC';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

// Request

export interface CreateClinicRequest {
    name: string;
    type: ClinicType;
    consultationFees: number;
    consultationDurationMinutes: number;
    contactNumber?: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
}

export interface UpdateClinicRequest {
    name?: string;
    type?: ClinicType;
    consultationFees?: number;
    consultationDurationMinutes?: number;
    contactNumber?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
}

export interface ScheduleEntry {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
}

export interface ClinicScheduleRequest {
    schedules: ScheduleEntry[];
    startDate: string;
    endDate: string;
}

// Response

export interface ClinicScheduleResponse {
    id: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    active: boolean;
}

export interface ClinicResponse {
    id: string;
    name: string;
    type: ClinicType;
    consultationFees: number;
    consultationDurationMinutes: number;
    contactNumber: string | null;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    active: boolean;
    schedules: ClinicScheduleResponse[];
}

// Label maps

export const CLINIC_TYPE_LABELS: Record<string, string> = {
    IN_PERSON: 'In Person',
    ONLINE: 'Online',
    PRIVATE_CLINIC: 'Private Clinic',
    HOSPITAL: 'Hospital',
    CLINIC: 'Clinic',
};

export const DAY_LABELS: Record<DayOfWeek, string> = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun',
};
