import { useQueryClient } from '@tanstack/react-query';
import { useAppQuery } from '../../../shared/hooks/useAppQuery';
import { useAppMutation } from '../../../shared/hooks/useAppMutation';
import { adminService } from '../services/adminService';
import type { ResponseWrapper } from '../../../types/api.types';
import type { OverviewResponse, PendingDoctorResponse } from '../types/admin.types';

export const PENDING_DOCTORS_KEY = ['admin', 'doctors', 'pending'] as const;
export const OVERVIEW_KEY = ['admin', 'overview'] as const;

export function usePendingDoctors() {
    return useAppQuery<ResponseWrapper<PendingDoctorResponse[]>>({
        queryKey: PENDING_DOCTORS_KEY,
        queryFn: () => adminService.getPendingDoctors(),
        staleTime: 30_000,
    });
}

export function useOverview() {
    return useAppQuery<ResponseWrapper<OverviewResponse>>({
        queryKey: OVERVIEW_KEY,
        queryFn: () => adminService.getOverview(),
        staleTime: 60_000,
    });
}

export function useVerifyDoctor() {
    const qc = useQueryClient();
    return useAppMutation<void, string>({
        mutationFn: (doctorId) => adminService.verifyDoctor(doctorId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: PENDING_DOCTORS_KEY });
            qc.invalidateQueries({ queryKey: OVERVIEW_KEY });
        },
    });
}

export function useRejectDoctor() {
    const qc = useQueryClient();
    return useAppMutation<void, { doctorId: string; reason: string }>({
        mutationFn: ({ doctorId, reason }) => adminService.rejectDoctor(doctorId, reason),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: PENDING_DOCTORS_KEY });
            qc.invalidateQueries({ queryKey: OVERVIEW_KEY });
        },
    });
}