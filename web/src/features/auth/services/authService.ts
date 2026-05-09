import { apiClient } from '../../../lib/axios';
import type { ResponseWrapper } from '../../../types/api.types.ts';
import type {
    AuthResponse,
    LoginRequest,
    PatientRegisterRequest,
    DoctorRegisterRequest,
    LogoutRequest,
    TokenResponse,
} from '../types/auth.types.ts';

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
};