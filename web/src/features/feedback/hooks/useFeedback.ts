import {useQueryClient} from '@tanstack/react-query';
import {useAppQuery} from '../../../shared/hooks/useAppQuery';
import {useAppMutation} from '../../../shared/hooks/useAppMutation';
import {feedbackService} from '../services/feedbackService';
import type {ResponseWrapper} from '../../../types/api.types';
import type {
    DoctorFeedbackSummary,
    FeedbackResponse,
    PatientFeedbackPage,
    SubmitFeedbackRequest,
    UpdateFeedbackRequest,
} from '../types/feedback.types';
import {AppError} from '../../../shared/utils/errorParser';

// Query Keys

export const doctorFeedbackKey = (doctorId: string, page: number, size: number) =>
    ['feedback', 'doctor', doctorId, page, size] as const;

export const MY_SUBMITTED_FEEDBACK_KEY = ['feedback', 'patient', 'my'] as const;
export const MY_RECEIVED_FEEDBACK_KEY = ['feedback', 'doctor', 'my'] as const;

// Doctor public feedback — used on DoctorPublicProfilePage

export function useDoctorFeedback(doctorId: string, page = 0, size = 10) {
    return useAppQuery<ResponseWrapper<DoctorFeedbackSummary>>({
        queryKey: doctorFeedbackKey(doctorId, page, size),
        queryFn: () => feedbackService.getDoctorFeedback(doctorId, page, size),
        enabled: !!doctorId,
        staleTime: 1000 * 60 * 2,
        // Do not retry on 404 — doctor may have no feedback yet (still valid)
        retry: (failureCount, error) => {
            if (error instanceof AppError && !error.isServerError) return false;
            return failureCount < 2;
        },
    });
}

// Patient: feedback they submitted

export function useMySubmittedFeedback(page = 0, size = 10) {
    return useAppQuery<ResponseWrapper<PatientFeedbackPage>>({
        queryKey: [...MY_SUBMITTED_FEEDBACK_KEY, page, size],
        queryFn: () => feedbackService.getMySubmittedFeedback(page, size),
        staleTime: 30_000,
    });
}

// Doctor: feedback they received

export function useMyReceivedFeedback(page = 0, size = 10) {
    return useAppQuery<ResponseWrapper<PatientFeedbackPage>>({
        queryKey: [...MY_RECEIVED_FEEDBACK_KEY, page, size],
        queryFn: () => feedbackService.getMyReceivedFeedback(page, size),
        staleTime: 30_000,
    });
}

// Submit feedback

export function useSubmitFeedback(doctorId: string) {
    const qc = useQueryClient();
    return useAppMutation<ResponseWrapper<FeedbackResponse>, SubmitFeedbackRequest>({
        mutationFn: (data) => feedbackService.submitFeedback(doctorId, data),
        onSuccess: () => {
            // Invalidate patient's feedback list
            qc.invalidateQueries({queryKey: MY_SUBMITTED_FEEDBACK_KEY});
            // Invalidate doctor's public feedback (avg rating + reviews update)
            qc.invalidateQueries({queryKey: ['feedback', 'doctor', doctorId]});
        },
    });
}

// Update feedback

export function useUpdateFeedback() {
    const qc = useQueryClient();
    return useAppMutation<
        ResponseWrapper<FeedbackResponse>,
        { feedbackId: string; data: UpdateFeedbackRequest }
    >({
        mutationFn: ({feedbackId, data}) =>
            feedbackService.updateFeedback(feedbackId, data),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: MY_SUBMITTED_FEEDBACK_KEY});
            // Refresh doctor public pages — we don't know which doctorId here,
            // so invalidate the whole feedback namespace for safety.
            qc.invalidateQueries({queryKey: ['feedback', 'doctor']});
        },
    });
}

// Delete feedback

export function useDeleteFeedback() {
    const qc = useQueryClient();
    return useAppMutation<void, string>({
        mutationFn: (feedbackId) => feedbackService.deleteFeedback(feedbackId),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: MY_SUBMITTED_FEEDBACK_KEY});
            qc.invalidateQueries({queryKey: ['feedback', 'doctor']});
        },
    });
}