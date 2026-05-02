package com.healthcare.feedback.controller;

import com.healthcare.feedback.payload.dto.success.ResponseWrapper;
import com.healthcare.feedback.payload.request.SubmitFeedbackRequest;
import com.healthcare.feedback.payload.request.UpdateFeedbackRequest;
import com.healthcare.feedback.payload.response.DoctorFeedbackSummary;
import com.healthcare.feedback.payload.response.FeedbackResponse;
import com.healthcare.feedback.service.FeedbackService;
import com.healthcare.feedback.util.ResponseUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(
        name = "Feedback",
        description = "Endpoints for submitting, viewing and managing doctor feedback. " +
                "Patients can only submit feedback for completed appointments."
)
@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Unauthorized — missing or invalid token",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "403", description = "Forbidden — insufficient role",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Operation(
            summary = "Submit feedback",
            description = """
                    Submits feedback for a doctor after a completed appointment.
                    
                    **Eligibility rules:**
                    - The appointment must be in COMPLETED status
                    - The appointment must belong to the authenticated patient
                    - Only one feedback is allowed per appointment
                    
                    Eligibility is checked locally via the `feedback_eligibility` collection 
                    without making a runtime call to appointment-service.
                    """
    )
    @ApiResponse(responseCode = "201", description = "Feedback submitted successfully")
    @ApiResponse(responseCode = "400", description = "Validation failed or duplicate feedback attempt",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @ApiResponse(responseCode = "404", description = "Appointment not eligible or not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PostMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<FeedbackResponse>> submitFeedback(
            @AuthenticationPrincipal String patientId,
            @Parameter(description = "Doctor's profile ID to submit feedback for")
            @PathVariable String doctorId,
            @Valid @RequestBody SubmitFeedbackRequest request
    ) {
        return ResponseUtil.created(
                "Feedback submitted successfully",
                feedbackService.submitFeedback(patientId, doctorId, request)
        );
    }

    @Operation(
            summary = "Get doctor feedback",
            description = "Public endpoint — no authentication required. " +
                    "Returns aggregated rating summary and paginated individual reviews for a doctor. " +
                    "Used on the doctor's public profile page."
    )
    @ApiResponse(responseCode = "200", description = "Doctor feedback fetched successfully")
    @ApiResponse(responseCode = "404", description = "Doctor not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ResponseWrapper<DoctorFeedbackSummary>> getDoctorFeedback(
            @Parameter(description = "Doctor's profile ID")
            @PathVariable String doctorId,
            @Parameter(description = "0-based page number", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseUtil.ok(
                "Doctor feedback fetched successfully",
                feedbackService.getDoctorFeedback(doctorId, page, size)
        );
    }

    @Operation(
            summary = "Get my submitted feedback",
            description = "Returns paginated list of all feedback the authenticated patient has submitted"
    )
    @ApiResponse(responseCode = "200", description = "Submitted feedback fetched successfully")
    @GetMapping("/patient/my")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<Map<String, Object>>> getMySubmittedFeedback(
            @AuthenticationPrincipal String patientId,
            @Parameter(description = "0-based page number", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<FeedbackResponse> result =
                feedbackService.getMySubmittedFeedback(patientId, page, size);
        return ResponseUtil.paginated("Submitted feedback fetched successfully", result);
    }

    @Operation(
            summary = "Get my received feedback",
            description = "Returns paginated list of all feedback the authenticated doctor has received"
    )
    @ApiResponse(responseCode = "200", description = "Received feedback fetched successfully")
    @GetMapping("/doctor/my")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<Map<String, Object>>> getMyReceivedFeedback(
            @AuthenticationPrincipal String doctorId,
            @Parameter(description = "0-based page number", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<FeedbackResponse> result =
                feedbackService.getMyReceivedFeedback(doctorId, page, size);
        return ResponseUtil.paginated("Received feedback fetched successfully", result);
    }

    @Operation(
            summary = "Update feedback",
            description = "Updates an existing feedback entry. " +
                    "Only the patient who originally submitted the feedback can update it."
    )
    @ApiResponse(responseCode = "200", description = "Feedback updated successfully")
    @ApiResponse(responseCode = "400", description = "Validation failed",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @ApiResponse(responseCode = "404", description = "Feedback not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PutMapping("/{feedbackId}")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<FeedbackResponse>> updateFeedback(
            @AuthenticationPrincipal String patientId,
            @Parameter(description = "Feedback document ID to update")
            @PathVariable String feedbackId,
            @Valid @RequestBody UpdateFeedbackRequest request
    ) {
        return ResponseUtil.ok(
                "Feedback updated successfully",
                feedbackService.updateFeedback(feedbackId, patientId, request)
        );
    }

    @Operation(
            summary = "Delete feedback",
            description = """
                    Deletes an existing feedback entry submitted by the authenticated patient.
                    
                    The eligibility record is preserved after deletion, so the patient 
                    can re-submit feedback for the same appointment if needed.
                    """
    )
    @ApiResponse(responseCode = "204", description = "Feedback deleted successfully")
    @ApiResponse(responseCode = "404", description = "Feedback not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @DeleteMapping("/{feedbackId}")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<Void> deleteFeedback(
            @AuthenticationPrincipal String patientId,
            @Parameter(description = "Feedback document ID to delete")
            @PathVariable String feedbackId
    ) {
        feedbackService.deleteFeedback(feedbackId, patientId);
        return ResponseUtil.noContent();
    }
}