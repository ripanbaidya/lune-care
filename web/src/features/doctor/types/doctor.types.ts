export type DoctorGender = 'MALE' | 'FEMALE' | 'OTHER';

export type DocumentType = 'MEDICAL_LICENSE' | 'DEGREE_CERTIFICATE' | 'ID_PROOF' | 'REGISTRATION_CERTIFICATE';

export type Specialization =
    | 'GENERAL_PHYSICIAN'
    | 'CARDIOLOGIST'
    | 'DERMATOLOGIST'
    | 'NEUROLOGIST'
    | 'ORTHOPEDIC'
    | 'PEDIATRICIAN'
    | 'PSYCHIATRIST'
    | 'GYNECOLOGIST'
    | 'ONCOLOGIST'
    | 'RADIOLOGIST'
    | 'UROLOGIST'
    | 'OPHTHALMOLOGIST'
    | 'ENT_SPECIALIST'
    | 'ENDOCRINOLOGIST'
    | 'GASTROENTEROLOGIST'
    | 'PULMONOLOGIST'
    | 'RHEUMATOLOGIST'
    | 'NEPHROLOGIST'
    | 'HEMATOLOGIST'
    | 'ALLERGIST'
    | 'PLASTIC_SURGEON'
    | 'NEUROSURGEON'
    | 'ANESTHESIOLOGIST'
    | 'PATHOLOGIST'
    | 'DENTIST';

// Request

export interface OnboardingRequest {
    email?: string;
    gender: DoctorGender;
    dateOfBirth: string;
    specialization: Specialization;
    qualification: string;
    yearsOfExperience: number;
    bio?: string;
    languagesSpoken?: string[];
}

export interface UpdateDoctorProfileRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    gender?: DoctorGender;
    dateOfBirth?: string;
    specialization?: Specialization;
    qualification?: string;
    yearsOfExperience?: number;
    bio?: string;
    languagesSpoken?: string[];
}

// Response

export interface DoctorProfileResponse {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    profilePhotoUrl: string | null;
    onboardingCompleted: boolean;
    email: string | null;
    gender: DoctorGender | null;
    dateOfBirth: string | null;
    specialization: Specialization | null;
    qualification: string | null;
    yearsOfExperience: number | null;
    bio: string | null;
    languagesSpoken: string[];
}

export interface DoctorDocumentResponse {
    id: string;
    documentType: DocumentType;
    documentUrl: string;
    uploadedAt: string;
}

// Label maps
export const SPECIALIZATION_LABELS: Record<Specialization, string> = {
    GENERAL_PHYSICIAN: 'General Physician',
    CARDIOLOGIST: 'Cardiologist',
    DERMATOLOGIST: 'Dermatologist',
    NEUROLOGIST: 'Neurologist',
    ORTHOPEDIC: 'Orthopedic',
    PEDIATRICIAN: 'Pediatrician',
    PSYCHIATRIST: 'Psychiatrist',
    GYNECOLOGIST: 'Gynecologist',
    ONCOLOGIST: 'Oncologist',
    RADIOLOGIST: 'Radiologist',
    UROLOGIST: 'Urologist',
    OPHTHALMOLOGIST: 'Ophthalmologist',
    ENT_SPECIALIST: 'ENT Specialist',
    ENDOCRINOLOGIST: 'Endocrinologist',
    GASTROENTEROLOGIST: 'Gastroenterologist',
    PULMONOLOGIST: 'Pulmonologist',
    RHEUMATOLOGIST: 'Rheumatologist',
    NEPHROLOGIST: 'Nephrologist',
    HEMATOLOGIST: 'Hematologist',
    ALLERGIST: 'Allergist',
    PLASTIC_SURGEON: 'Plastic Surgeon',
    NEUROSURGEON: 'Neurosurgeon',
    ANESTHESIOLOGIST: 'Anesthesiologist',
    PATHOLOGIST: 'Pathologist',
    DENTIST: 'Dentist',
};

export const GENDER_LABELS: Record<DoctorGender, string> = {
    MALE: 'Male',
    FEMALE: 'Female',
    OTHER: 'Other',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    MEDICAL_LICENSE: 'Medical License',
    DEGREE_CERTIFICATE: 'Degree Certificate',
    ID_PROOF: 'ID Proof',
    REGISTRATION_CERTIFICATE: 'Registration Certificate',
};

// Alias used in DoctorPublicProfilePage — keep consistent with doctor-clinic.types.ts
export const CLINIC_TYPE_LABELS_MAP: Record<string, string> = {
    IN_PERSON: 'In Person',
    ONLINE: 'Online',
    PRIVATE_CLINIC: 'Private Clinic',
    HOSPITAL: 'Hospital',
    CLINIC: 'Clinic',
};