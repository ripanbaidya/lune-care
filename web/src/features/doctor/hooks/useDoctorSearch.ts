import {useAppQuery} from '../../../shared/hooks/useAppQuery';
import {apiClient} from '../../../lib/axios';
import type {ResponseWrapper} from '../../../types/api.types';

export interface DoctorSearchResult {
    id: string;           // profile id
    userId: string;       // auth user id — THIS is what slots API needs
    firstName: string;
    lastName: string;
    profilePhotoUrl: string | null;
    specialization: string | null;
    qualification: string | null;
    yearsOfExperience: number;
    bio: string | null;
    languagesSpoken: string[];
    clinics: DoctorClinicResult[];
}

export interface DoctorClinicResult {
    id: string;
    name: string;
    type: string;
    consultationFees: number;
    consultationDurationMinutes: number;
    contactNumber: string | null;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    active: boolean;
    schedules: { id: string; dayOfWeek: string; startTime: string; endTime: string; active: boolean }[];
}

export interface DoctorSearchPage {
    filters: { name?: string; specialization?: string; city?: string; maxFees?: number };
    content: DoctorSearchResult[];
    page: { number: number; size: number; totalElements: number; totalPages: number };
}

interface SearchParams {
    name?: string;
    specialization?: string;
    city?: string;
    maxFees?: number;
    page?: number;
    size?: number;
}

async function searchDoctors(params: SearchParams): Promise<ResponseWrapper<DoctorSearchPage>> {
    const res = await apiClient.get<ResponseWrapper<DoctorSearchPage>>('/doctor/search', {
        params: Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null)),
    });
    return res.data;
}

export function useDoctorSearch(params: SearchParams) {
    return useAppQuery<ResponseWrapper<DoctorSearchPage>>({
        queryKey: ['doctor', 'search', params],
        queryFn: () => searchDoctors(params),
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}
