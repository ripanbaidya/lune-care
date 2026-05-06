import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAppMutation} from '../../../shared/hooks/useAppMutation';
import {authService} from '../authService';
import {useAuthStore} from '../../../store/authStore';
import {AppError} from '../../../shared/utils/errorParser.ts';
import {ROUTES} from '../../../routes/routePaths';

export function useLogin() {
    const navigate = useNavigate();
    const {setAuth} = useAuthStore();

    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);

    const {mutate, isPending} = useAppMutation({
        mutationFn: () => authService.login({phoneNumber, password}),

        onSuccess: (res) => {
            const {user, token} = res.data;
            setAuth(user, token.accessToken, token.refreshToken);

            // Role-based redirect
            // Doctor → onboarding (will be replaced with proper check when doctor service is built)
            if (user.role === 'ROLE_DOCTOR') {
                navigate(ROUTES.doctorOnboarding, {replace: true});
            } else if (user.role === 'ROLE_ADMIN') {
                navigate(ROUTES.adminDashboard, {replace: true});
            } else {
                navigate(ROUTES.patientDashboard, {replace: true});
            }
        },

        onError: (error: AppError) => {
            setFieldErrors({});
            setFormError(null);
            if (error.isValidation) {
                setFieldErrors(error.toFieldErrorMap());
            } else {
                setFormError(error.message);
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setFormError(null);
        mutate();
    };

    return {
        phoneNumber,
        setPhoneNumber,
        password,
        setPassword,
        fieldErrors,
        formError,
        isPending,
        handleSubmit,
    };
}