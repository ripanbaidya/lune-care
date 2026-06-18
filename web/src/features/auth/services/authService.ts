import { apiClient } from '../../../lib/axios';
import type { ResponseWrapper } from '../../../types/api.types';
import type {
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    PatientRegisterRequest,
    DoctorRegisterRequest,
    LogoutRequest,
    PasswordResetResponse,
    TokenResponse,
    ResetPasswordRequest,
} from '../types/auth.types';

export const authService = {
    login: async (data: LoginRequest): Promise<ResponseWrapper<AuthResponse>> => {
        const res = await apiClient.post<ResponseWrapper<AuthResponse>>('/auth/login', data);
        return res.data;
    },

    registerPatient: async (
        data: PatientRegisterRequest,
    ): Promise<ResponseWrapper<AuthResponse>> => {
        const res = await apiClient.post<ResponseWrapper<AuthResponse>>(
            '/auth/register/patient',
            data,
        );
        return res.data;
    },

    registerDoctor: async (
        data: DoctorRegisterRequest,
    ): Promise<ResponseWrapper<AuthResponse>> => {
        const res = await apiClient.post<ResponseWrapper<AuthResponse>>(
            '/auth/register/doctor',
            data,
        );
        return res.data;
    },

    logout: async (data: LogoutRequest): Promise<void> => {
        await apiClient.post('/users/logout', data);
    },

    refresh: async (refreshToken: string): Promise<ResponseWrapper<TokenResponse>> => {
        const res = await apiClient.post<ResponseWrapper<TokenResponse>>('/auth/refresh', {
            refreshToken,
        });
        return res.data;
    },

    forgotPassword: async (
        data: ForgotPasswordRequest,
    ): Promise<ResponseWrapper<PasswordResetResponse>> => {
        const res = await apiClient.post<ResponseWrapper<PasswordResetResponse>>(
            '/auth/password/forgot',
            data,
        );
        return res.data;
    },

    resetPassword: async (data: ResetPasswordRequest): Promise<ResponseWrapper<void>> => {
        const res = await apiClient.post<ResponseWrapper<void>>('/auth/password/reset', data);
        return res.data;
    },
};
