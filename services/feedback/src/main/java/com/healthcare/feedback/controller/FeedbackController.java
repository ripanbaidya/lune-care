package com.healthcare.feedback.controller;

import com.healthcare.feedback.payload.dto.success.ResponseWrapper;
import com.healthcare.feedback.payload.request.SubmitFeedbackRequest;
import com.healthcare.feedback.payload.request.UpdateFeedbackRequest;
import com.healthcare.feedback.payload.response.DoctorFeedbackSummary;
import com.healthcare.feedback.payload.response.FeedbackResponse;
import com.healthcare.feedback.service.FeedbackService;
import com.healthcare.feedback.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<FeedbackResponse>> submitFeedback(
            @AuthenticationPrincipal String patientId,
            @PathVariable String doctorId,
            @Valid @RequestBody SubmitFeedbackRequest request
    ) {
        return ResponseUtil.created(
                "Feedback submitted successfully",
                feedbackService.submitFeedback(patientId, doctorId, request)
        );
    }

    /**
     * Public: no authentication required.
     * Returns paginated feedback + average rating for a doctor.
     * Used on the doctor's public profile page.
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ResponseWrapper<DoctorFeedbackSummary>> getDoctorFeedback(
            @PathVariable String doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseUtil.ok(
                "Doctor feedback fetched successfully",
                feedbackService.getDoctorFeedback(doctorId, page, size)
        );
    }

    /**
     * Patient views all feedback they have submitted — paginated.
     */
    @GetMapping("/patient/my")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<Map<String, Object>>> getMySubmittedFeedback(
            @AuthenticationPrincipal String patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<FeedbackResponse> result =
                feedbackService.getMySubmittedFeedback(patientId, page, size);
        return ResponseUtil.paginated("Submitted feedback fetched successfully", result);
    }

    /**
     * Doctor views all feedback they have received — paginated.
     */
    @GetMapping("/doctor/my")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<Map<String, Object>>> getMyReceivedFeedback(
            @AuthenticationPrincipal String doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<FeedbackResponse> result =
                feedbackService.getMyReceivedFeedback(doctorId, page, size);
        return ResponseUtil.paginated("Received feedback fetched successfully", result);
    }

    /**
     * Patient updates their own feedback.
     */
    @PutMapping("/{feedbackId}")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<FeedbackResponse>> updateFeedback(
            @AuthenticationPrincipal String patientId,
            @PathVariable String feedbackId,
            @Valid @RequestBody UpdateFeedbackRequest request
    ) {
        return ResponseUtil.ok(
                "Feedback updated successfully",
                feedbackService.updateFeedback(feedbackId, patientId, request)
        );
    }

    /**
     * Patient deletes their own feedback.
     * Eligibility record is preserved — re-submission is allowed.
     */
    @DeleteMapping("/{feedbackId}")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<Void> deleteFeedback(
            @AuthenticationPrincipal String patientId,
            @PathVariable String feedbackId
    ) {
        feedbackService.deleteFeedback(feedbackId, patientId);
        return ResponseUtil.noContent();
    }
}