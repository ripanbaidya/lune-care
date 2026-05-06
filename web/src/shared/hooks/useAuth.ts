import {useAuthStore} from '../../store/authStore';

export const useAuth = () => {
    const {user, accessToken, setAuth, clearAuth} = useAuthStore();

    return {
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        role: user?.role ?? null,
        isPatient: user?.role === 'ROLE_PATIENT',
        isDoctor: user?.role === 'ROLE_DOCTOR',
        isAdmin: user?.role === 'ROLE_ADMIN',
        setAuth,
        logout: clearAuth,
    };
};