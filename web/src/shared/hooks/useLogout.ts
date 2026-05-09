import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../features/auth/services/authService';
import { ROUTES } from '../../routes/routePaths';
import { clearApiAuthHeader } from '../../lib/axios';

export function useLogout() {
    const { clearAuth, refreshToken } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return async () => {
        try {
            if (refreshToken) await authService.logout({ refreshToken });
        } catch {
            // best-effort — server-side token invalidation
        } finally {
            clearAuth();
            clearApiAuthHeader();
            queryClient.clear(); // ← kills all cached queries, stops background refetches
            navigate(ROUTES.login, { replace: true });
        }
    };
}
