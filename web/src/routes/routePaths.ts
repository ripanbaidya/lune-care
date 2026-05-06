/* Centralized route paths */

export const PUBLIC_ROUTES = {
    home: '/',
    login: '/login',
    register: '/register',
} as const;

export const PATIENT_ROUTES = {
    patientDashboard: '/patient/dashboard',
    patientProfile: '/patient/profile',
    patientAddress: '/patient/address',
    patientAppointments: '/patient/appointments',
    patientNotifications: '/patient/notifications',
} as const;

export const DOCTOR_ROUTES = {
    doctorOnboarding: '/doctor/onboarding',
    doctorDashboard: '/doctor/dashboard',
} as const;

export const ADMIN_ROUTES = {
    adminDashboard: '/admin/dashboard',
} as const;

export const ROUTES = {
    ...PUBLIC_ROUTES,
    ...PATIENT_ROUTES,
    ...DOCTOR_ROUTES,
    ...ADMIN_ROUTES,
} as const;

export type PublicRoute = typeof ROUTES[keyof typeof PUBLIC_ROUTES];
export type PatientRoute = typeof ROUTES[keyof typeof PATIENT_ROUTES];
export type DoctorRoute = typeof ROUTES[keyof typeof DOCTOR_ROUTES];
export type AdminRoute = typeof ROUTES[keyof typeof ADMIN_ROUTES];
export type AppRoutes = typeof ROUTES[keyof typeof ROUTES];