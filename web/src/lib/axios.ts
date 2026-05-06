// Silent refresh on 401 — refresh endpoint: POST /api/auth/refresh
// Serializes concurrent 401s so only one refresh is fired.

import axios, {
    type AxiosError,
    type AxiosRequestConfig,
    type InternalAxiosRequestConfig,
} from 'axios';
import {parseError} from '../shared/utils/errorUtils';
import {useAuthStore} from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {'Content-Type': 'application/json'},
    timeout: 15_000,
});

type QueueEntry = {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
};

let isRefreshing = false;
let pendingQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null) {
    pendingQueue.forEach((entry) => {
        if (error) entry.reject(error);
        else entry.resolve(token!);
    });
    pendingQueue = [];
}

// Request interceptor - attach access token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(parseError(error)),
);

// Response interceptor - silent refresh on 401
apiClient.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
            _retry?: boolean;
        };

        const is401 = error.response?.status === 401;
        // NOTE: backend refresh endpoint is /api/auth/refresh (not /refresh-token)
        const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');

        if (!is401 || originalRequest._retry || isRefreshEndpoint) {
            return Promise.reject(parseError(error));
        }

        // TODO: setAuth is declared but its value is never read [Might Need Fix]
        // const {refreshToken, setAuth, clearAuth} = useAuthStore.getState();
        const {refreshToken, clearAuth} = useAuthStore.getState();

        if (!refreshToken) {
            clearAuth();
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            return Promise.reject(parseError(error));
        }

        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                pendingQueue.push({resolve, reject});
            })
                .then((newAccessToken) => {
                    originalRequest._retry = true;
                    if (originalRequest.headers) {
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    } else {
                        originalRequest.headers = {Authorization: `Bearer ${newAccessToken}`};
                    }
                    return apiClient(originalRequest);
                })
                .catch((err) => Promise.reject(parseError(err)));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const response = await axios.post(
                `${apiClient.defaults.baseURL}/auth/refresh`,
                {refreshToken},
                {headers: {'Content-Type': 'application/json'}},
            );

            // Backend: ResponseWrapper<TokenResponse>
            const tokenData = response.data?.data;
            const newAccessToken: string = tokenData.accessToken;
            const newRefreshToken: string = tokenData.refreshToken;

            const {user, setAuth} = useAuthStore.getState();
            if (user) {
                setAuth(user, newAccessToken, newRefreshToken);
            }

            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);

            if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            } else {
                originalRequest.headers = {Authorization: `Bearer ${newAccessToken}`};
            }
            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            clearAuth();
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            return Promise.reject(parseError(refreshError as AxiosError));
        } finally {
            isRefreshing = false;
        }
    },
);