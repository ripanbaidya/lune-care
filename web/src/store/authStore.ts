import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {UserResponse} from '../features/auth/auth.types';

interface AuthState {
    user: UserResponse | null;
    accessToken: string | null;
    refreshToken: string | null;
    setAuth: (user: UserResponse, accessToken: string, refreshToken: string) => void;
    updateUser: (partial: Partial<UserResponse>) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,

            setAuth: (user, accessToken, refreshToken) =>
                set({user, accessToken, refreshToken}),

            updateUser: (partial) =>
                set((state) => ({
                    user: state.user ? {...state.user, ...partial} : null,
                })),

            clearAuth: () =>
                set({user: null, accessToken: null, refreshToken: null}),
        }),
        {
            name: 'lunecare-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
        },
    ),
);