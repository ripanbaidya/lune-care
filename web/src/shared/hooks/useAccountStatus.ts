import {useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {apiClient} from '../../lib/axios';
import {useAuthStore} from '../../store/authStore';
import {ROUTES} from '../../routes/routePaths';
import type {ResponseWrapper} from '../../types/api.types';
import type {UserResponse} from '../../features/auth/auth.types';

const POLL_INTERVAL_MS = 10_000; // 10 seconds

/**
 * Polls GET /api/users/me every 10s when the doctor is in PENDING_VERIFICATION status.
 * On ACTIVE → redirects to dashboard.
 * On ONBOARDING → redirects back to onboarding.
 */
export function useAccountStatusPoller() {
    const {user, updateUser} = useAuthStore();
    const navigate = useNavigate();
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'ROLE_DOCTOR') return;
        if (user.status !== 'PENDING_VERIFICATION') return;

        const poll = async () => {
            try {
                const res = await apiClient.get<ResponseWrapper<UserResponse>>('/users/me');
                const freshStatus = res.data?.data?.status;

                if (!freshStatus) return;

                if (freshStatus !== user.status) {
                    updateUser({status: freshStatus});
                }

                if (freshStatus === 'ACTIVE') {
                    clearInterval(intervalRef.current!);
                    navigate(ROUTES.doctorDashboard, {replace: true});
                } else if (freshStatus === 'ONBOARDING') {
                    clearInterval(intervalRef.current!);
                    navigate(ROUTES.doctorOnboarding, {replace: true});
                }
            } catch {
                // Silent — network errors shouldn't crash the page
            }
        };

        intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [user?.status]);
}