// Enums
export const ROLES = {
    PATIENT: 'ROLE_PATIENT',
    DOCTOR: 'ROLE_DOCTOR',
    ADMIN: 'ROLE_ADMIN',
} as const;

export const ACCOUNT_STATUS = {
    INACTIVE: 'INACTIVE',
    ACTIVE: 'ACTIVE',
    ONBOARDING: 'ONBOARDING',
    PENDING_VERIFICATION: 'PENDING_VERIFICATION',
    SUSPENDED: 'SUSPENDED'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
export type AccountStatus = typeof ACCOUNT_STATUS[keyof typeof ACCOUNT_STATUS];

// Response
export interface UserResponse {
    id: string;
    role: Role;
    status: AccountStatus;
    profilePhotoUrl?: string | null;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresInMillis: number;
}

export interface AuthResponse {
    user: UserResponse;
    token: TokenResponse;
}

// Request

export interface LoginRequest {
    phoneNumber: string;
    password: string;
}

export interface PatientRegisterRequest {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password: string;
}

export interface DoctorRegisterRequest {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password: string;
}

export interface LogoutRequest {
    refreshToken: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}
