export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type BloodGroup =
    | 'A_POSITIVE' | 'A_NEGATIVE'
    | 'B_POSITIVE' | 'B_NEGATIVE'
    | 'O_POSITIVE' | 'O_NEGATIVE'
    | 'AB_POSITIVE' | 'AB_NEGATIVE';

export interface PatientProfileResponse {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string | null;
    dateOfBirth: string | null; // ISO date string "YYYY-MM-DD"
    gender: Gender | null;
    bloodGroup: BloodGroup | null;
    profilePhotoUrl: string | null;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string;
    gender?: Gender;
    bloodGroup?: BloodGroup;
}

export const BLOOD_GROUP_LABELS: Record<BloodGroup, string> = {
    A_POSITIVE: 'A+',
    A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+',
    B_NEGATIVE: 'B-',
    O_POSITIVE: 'O+',
    O_NEGATIVE: 'O-',
    AB_POSITIVE: 'AB+',
    AB_NEGATIVE: 'AB-',
};

export const GENDER_LABELS: Record<Gender, string> = {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other',
};