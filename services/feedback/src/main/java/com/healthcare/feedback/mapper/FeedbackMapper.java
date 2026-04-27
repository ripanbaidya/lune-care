package com.healthcare.feedback.mapper;

import com.healthcare.feedback.entity.Feedback;
import com.healthcare.feedback.payload.response.FeedbackResponse;

public final class FeedbackMapper {

    private FeedbackMapper() {
    }

    public static FeedbackResponse toResponse(Feedback feedback) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .appointmentId(feedback.getAppointmentId())
                .doctorId(feedback.getDoctorId())
                .patientId(feedback.getPatientId())
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .build();
    }
}