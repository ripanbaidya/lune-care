import {useAppQuery} from '../../../shared/hooks/useAppQuery';
import {publicDoctorService} from '../services/publicDoctorService';
import type {DoctorSearchFilters, DoctorSearchResponse, PublicDoctorSummary} from '../types/public.types';
import type {ResponseWrapper} from '../../../types/api.types';

export function useSearchDoctors(filters: DoctorSearchFilters, enabled = true) {
    return useAppQuery<ResponseWrapper<DoctorSearchResponse>>({
        queryKey: ['public', 'doctors', 'search', filters],
        queryFn: () => publicDoctorService.searchDoctors(filters),
        enabled,
        // Results stay fresh for 2 minutes — public data
        staleTime: 1000 * 60 * 2,
    });
}

export function useDoctorPublic(doctorId: string) {
    return useAppQuery<ResponseWrapper<PublicDoctorSummary>>({
        queryKey: ['public', 'doctors', doctorId],
        queryFn: () => publicDoctorService.getDoctorPublic(doctorId),
        enabled: !!doctorId,
    });
}