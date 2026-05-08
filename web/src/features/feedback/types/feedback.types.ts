export interface FeedbackResponse {
    id: string;
    appointmentId: string;
    doctorId: string;
    patientId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SubmitFeedbackRequest {
    appointmentId: string;
    rating: number;
    comment?: string;
}

export interface UpdateFeedbackRequest {
    rating: number;
    comment?: string;
}

export interface DoctorFeedbackSummary {
    doctorId: string;
    averageRating: number;
    totalReviews: number;
    content: FeedbackResponse[];
    page: {
        number: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
}

export interface PatientFeedbackPage {
    content: FeedbackResponse[];
    page: {
        number: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
}