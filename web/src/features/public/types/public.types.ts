import type { ClinicType } from '../../doctor/types/doctor.clinic.types';
import type { Specialization } from '../../doctor/types/doctor.types';

export interface PublicSchedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface PublicClinic {
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
  schedules: PublicSchedule[];
}

export interface PublicDoctorSummary {
  id: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  specialization: Specialization | null;
  qualification: string | null;
  yearsOfExperience: number | null;
  bio: string | null;
  languagesSpoken: string[];
  clinics: PublicClinic[];
}

export interface DoctorSearchFilters {
  name?: string;
  specialization?: string;
  city?: string;
  maxFees?: number;
  page?: number;
  size?: number;
}

export interface DoctorSearchResponse {
  filters: {
    name: string | null;
    specialization: string | null;
    city: string | null;
    maxFees: number | null;
  };
  content: PublicDoctorSummary[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}