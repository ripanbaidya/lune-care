import {apiClient} from '../../../lib/axios';
import type {ResponseWrapper} from '../../../types/api.types';
import type {
    DoctorFeedbackSummary,
    FeedbackResponse,
    PatientFeedbackPage,
    SubmitFeedbackRequest,
    UpdateFeedbackRequest,
} from '../types/feedback.types';

export const feedbackService = {
    /**
     * POST /api/feedback/doctor/:doctorId
     * Patient submits feedback after a COMPLETED appointment.
     */
    submitFeedback: async (
        doctorId: string,
        data: SubmitFeedbackRequest,
    ): Promise<ResponseWrapper<FeedbackResponse>> => {
        const res = await apiClient.post<ResponseWrapper<FeedbackResponse>>(
            `/feedback/doctor/${doctorId}`,
            data,
        );
        return res.data;
    },

    /**
     * GET /api/feedback/doctor/:doctorId — public, no auth required
     * Used on doctor's public profile page.
     */
    getDoctorFeedback: async (
        doctorId: string,
        page = 0,
        size = 10,
    ): Promise<ResponseWrapper<DoctorFeedbackSummary>> => {
        const res = await apiClient.get<ResponseWrapper<DoctorFeedbackSummary>>(
            `/feedback/doctor/${doctorId}`,
            {params: {page, size}},
        );
        return res.data;
    },

    /**
     * GET /api/feedback/patient/my
     * Returns paginated feedback the authenticated patient has submitted.
     */
    getMySubmittedFeedback: async (
        page = 0,
        size = 10,
    ): Promise<ResponseWrapper<PatientFeedbackPage>> => {
        const res = await apiClient.get<ResponseWrapper<PatientFeedbackPage>>(
            '/feedback/patient/my',
            {params: {page, size}},
        );
        return res.data;
    },

    /**
     * GET /api/feedback/doctor/my
     * Returns paginated feedback the authenticated doctor has received.
     */
    getMyReceivedFeedback: async (
        page = 0,
        size = 10,
    ): Promise<ResponseWrapper<PatientFeedbackPage>> => {
        const res = await apiClient.get<ResponseWrapper<PatientFeedbackPage>>(
            '/feedback/doctor/my',
            {params: {page, size}},
        );
        return res.data;
    },

    /**
     * PUT /api/feedback/:feedbackId
     * Patient updates their existing feedback.
     */
    updateFeedback: async (
        feedbackId: string,
        data: UpdateFeedbackRequest,
    ): Promise<ResponseWrapper<FeedbackResponse>> => {
        const res = await apiClient.put<ResponseWrapper<FeedbackResponse>>(
            `/feedback/${feedbackId}`,
            data,
        );
        return res.data;
    },

    /**
     * DELETE /api/feedback/:feedbackId
     * Patient deletes their feedback (eligibility is preserved for re-submission).
     */
    deleteFeedback: async (feedbackId: string): Promise<void> => {
        await apiClient.delete(`/feedback/${feedbackId}`);
    },
};