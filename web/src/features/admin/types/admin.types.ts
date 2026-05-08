export interface DoctorDocumentResponse {
    id: string;
    documentType: 'MEDICAL_LICENSE' | 'DEGREE_CERTIFICATE' | 'ID_PROOF' | 'REGISTRATION_CERTIFICATE';
    documentUrl: string;
    uploadedAt: string;
}

export interface PendingDoctorResponse {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    specialization: string | null;
    qualification: string | null;
    createdAt: string;
    documents: DoctorDocumentResponse[];
}

export interface OverviewResponse {
    totalDoctors: number;
    pendingVerifications: number;
    totalPatients: number;
}

export interface RejectDoctorRequest {
    reason: string;
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
    MEDICAL_LICENSE: 'Medical License',
    DEGREE_CERTIFICATE: 'Degree Certificate',
    ID_PROOF: 'ID Proof',
    REGISTRATION_CERTIFICATE: 'Registration Certificate',
};