import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppMutation } from '../../../shared/hooks/useAppMutation';
import { authService } from '../../auth/services/authService';
import { useAuthStore } from '../../../store/authStore';
import { AppError } from '../../../shared/utils/errorParser';
import { ROUTES } from '../../../routes/routePaths';

export type RegisterTab = 'patient' | 'doctor';

interface FormState {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}

const EMPTY: FormState = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
};

export function useRegister() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const [activeTab, setActiveTab] = useState<RegisterTab>('patient');
    const [form, setForm] = useState<FormState>(EMPTY);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear field error on change
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const switchTab = (tab: RegisterTab) => {
        setActiveTab(tab);
        setForm(EMPTY);
        setFieldErrors({});
        setFormError(null);
    };

    // Client-side validation before hitting backend
    const validate = (): boolean => {
        const errors: Record<string, string> = {};

        if (!form.firstName.trim()) errors.firstName = 'First name is required';
        if (!form.lastName.trim()) errors.lastName = 'Last name is required';
        if (!form.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
        else if (!/^[0-9]{10}$/.test(form.phoneNumber))
            errors.phoneNumber = 'Phone number must be 10 digits';
        if (!form.password) errors.password = 'Password is required';
        else if (form.password.length < 8)
            errors.password = 'Password must be at least 8 characters';
        if (form.password !== form.confirmPassword)
            errors.confirmPassword = 'Passwords do not match';

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const { mutate: registerPatient, isPending: isPatientPending } = useAppMutation({
        mutationFn: () =>
            authService.registerPatient({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                phoneNumber: form.phoneNumber.trim(),
                password: form.password,
            }),
        onSuccess: (res) => {
            const { user, token } = res.data;
            setAuth(user, token.accessToken, token.refreshToken);
            navigate(ROUTES.patientDashboard, { replace: true });
        },
        onError: (error: AppError) => {
            if (error.isValidation) {
                setFieldErrors(error.toFieldErrorMap());
            } else if (error.isConflict) {
                setFieldErrors({ phoneNumber: error.message });
            } else {
                setFormError(error.message);
            }
        },
    });

    const { mutate: registerDoctor, isPending: isDoctorPending } = useAppMutation({
        mutationFn: () =>
            authService.registerDoctor({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                phoneNumber: form.phoneNumber.trim(),
                password: form.password,
            }),
        onSuccess: (res) => {
            const { user, token } = res.data;
            setAuth(user, token.accessToken, token.refreshToken);
            // Doctor goes to onboarding after register
            navigate(ROUTES.doctorOnboarding, { replace: true });
        },
        onError: (error: AppError) => {
            if (error.isValidation) {
                setFieldErrors(error.toFieldErrorMap());
            } else if (error.isConflict) {
                setFieldErrors({ phoneNumber: error.message });
            } else {
                setFormError(error.message);
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setFormError(null);

        if (!validate()) return;

        if (activeTab === 'patient') {
            registerPatient();
        } else {
            registerDoctor();
        }
    };

    const isPending = isPatientPending || isDoctorPending;

    return {
        activeTab,
        switchTab,
        form,
        handleChange,
        fieldErrors,
        formError,
        isPending,
        handleSubmit,
    };
}