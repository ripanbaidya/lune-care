package com.healthcare.feedback.service;

import com.healthcare.feedback.payload.request.SubmitFeedbackRequest;
import com.healthcare.feedback.payload.request.UpdateFeedbackRequest;
import com.healthcare.feedback.payload.response.DoctorFeedbackSummary;
import com.healthcare.feedback.payload.response.FeedbackResponse;
import org.springframework.data.domain.Page;

public interface FeedbackService {

    FeedbackResponse submitFeedback(String patientId, String doctorId, SubmitFeedbackRequest request);

    DoctorFeedbackSummary getDoctorFeedback(String doctorId, int page, int size);

    Page<FeedbackResponse> getMySubmittedFeedback(String patientId, int page, int size);

    Page<FeedbackResponse> getMyReceivedFeedback(String doctorId, int page, int size);

    FeedbackResponse updateFeedback(String feedbackId, String patientId, UpdateFeedbackRequest request);

    void deleteFeedback(String feedbackId, String patientId);
}