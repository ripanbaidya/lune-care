package com.healthcare.feedback.mapper;

import com.healthcare.feedback.entity.Feedback;
import com.healthcare.feedback.payload.response.FeedbackResponse;

public final class FeedbackMapper {

    private FeedbackMapper() {
    }

    public static FeedbackResponse toResponse(Feedback feedback) {
        return toResponse(feedback, null, null);
    }

    public static FeedbackResponse toResponse(Feedback feedback, String patientName) {
        return toResponse(feedback, patientName, null);
    }

    public static FeedbackResponse toResponse(Feedback feedback, String patientName, String doctorName) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .appointmentId(feedback.getAppointmentId())
                .doctorId(feedback.getDoctorId())
                .doctorName(doctorName)
                .patientId(feedback.getPatientId())
                .patientName(patientName)
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .build();
    }
}
