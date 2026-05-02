package com.healthcare.appointment.controller;

import com.healthcare.appointment.enums.CancelledBy;
import com.healthcare.appointment.payload.dto.success.ResponseWrapper;
import com.healthcare.appointment.payload.request.BookAppointmentRequest;
import com.healthcare.appointment.payload.request.CancelAppointmentRequest;
import com.healthcare.appointment.payload.response.AppointmentResponse;
import com.healthcare.appointment.payload.response.SlotResponse;
import com.healthcare.appointment.service.AppointmentService;
import com.healthcare.appointment.util.ResponseUtil;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Tag(name = "Appointments", description = "Endpoints for booking and managing appointments")
@RestController
@RequestMapping("/api/appointment")
@RequiredArgsConstructor
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Unauthorized — missing or invalid token",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "403", description = "Forbidden — insufficient role",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
public class AppointmentController {

    private final AppointmentService appointmentService;

    @Operation(
            summary = "Get available slots",
            description = "Returns all AVAILABLE slots for a specific doctor and clinic on a given date. " +
                    "Date must be provided in ISO 8601 format (YYYY-MM-DD)."
    )
    @ApiResponse(responseCode = "200", description = "Slots fetched successfully")
    @GetMapping("/slots/{doctorId}/{clinicId}")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<List<SlotResponse>>> getAvailableSlots(
            @Parameter(description = "Doctor's profile ID") @PathVariable String doctorId,
            @Parameter(description = "Clinic ID") @PathVariable String clinicId,
            @Parameter(description = "Date to fetch slots for (YYYY-MM-DD)", example = "2025-06-15")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        var response = appointmentService.getAvailableSlots(doctorId, clinicId, date);
        return ResponseUtil.ok("Slots fetched successfully!", response);
    }

    @Operation(
            summary = "Book an appointment",
            description = "Books an appointment against an available slot. " +
                    "Appointment is created with PENDING_PAYMENT status — patient must complete " +
                    "payment to confirm the appointment."
    )
    @ApiResponse(responseCode = "201", description = "Appointment booked successfully")
    @ApiResponse(responseCode = "400", description = "Validation failed or slot is unavailable",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @ApiResponse(responseCode = "404", description = "Slot not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @ApiResponse(responseCode = "409", description = "Slot already booked — optimistic lock conflict",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PostMapping("/book")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<AppointmentResponse>> bookAppointment(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody BookAppointmentRequest request
    ) {
        var response = appointmentService.bookAppointment(userId, request);
        return ResponseUtil.created("Appointment booked successfully!", response);
    }

    @Operation(
            summary = "Get appointment details",
            description = "Returns details of a specific appointment. Accessible by both the patient and doctor."
    )
    @ApiResponse(responseCode = "200", description = "Appointment fetched successfully")
    @ApiResponse(responseCode = "404", description = "Appointment not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @GetMapping("/{appointmentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<AppointmentResponse>> getAppointment(
            @Parameter(description = "Appointment ID") @PathVariable String appointmentId
    ) {
        var response = appointmentService.getAppointment(appointmentId);
        return ResponseUtil.ok("Appointment fetched successfully!", response);
    }

    @Operation(
            summary = "Cancel an appointment",
            description = "Cancels an appointment. Can be triggered by either a patient or a doctor. " +
                    "The role is determined from the X-User-Role header and recorded on the appointment."
    )
    @ApiResponse(responseCode = "200", description = "Appointment cancelled successfully")
    @ApiResponse(responseCode = "404", description = "Appointment not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PatchMapping("/{appointmentId}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_PATIENT', 'ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<AppointmentResponse>> cancelAppointment(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Appointment ID to cancel") @PathVariable String appointmentId,
            @Parameter(description = "Role of the user cancelling — ROLE_PATIENT or ROLE_DOCTOR")
            @RequestHeader("X-User-Role") String role,
            @RequestBody(required = false) CancelAppointmentRequest request
    ) {
        CancelledBy cancelledBy = role.equals("ROLE_DOCTOR") ? CancelledBy.DOCTOR : CancelledBy.PATIENT;
        var req = request != null ? request : new CancelAppointmentRequest(null);
        var response = appointmentService.cancelAppointment(appointmentId, userId, cancelledBy, req);
        return ResponseUtil.ok("Appointment cancelled successfully!", response);
    }

    @Operation(
            summary = "Complete an appointment",
            description = "Marks an appointment as COMPLETED. Only the doctor who owns the appointment can call this."
    )
    @ApiResponse(responseCode = "200", description = "Appointment marked as completed")
    @ApiResponse(responseCode = "404", description = "Appointment not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PatchMapping("/{appointmentId}/complete")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<AppointmentResponse>> completeAppointment(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Appointment ID to mark as completed") @PathVariable String appointmentId
    ) {
        var response = appointmentService.completeAppointment(appointmentId, userId);
        return ResponseUtil.ok("Appointment completed successfully!", response);
    }

    @Operation(
            summary = "Mark appointment as no-show",
            description = "Marks an appointment as NO_SHOW when the patient did not attend. " +
                    "Only the doctor can call this."
    )
    @ApiResponse(responseCode = "200", description = "Appointment marked as no-show")
    @ApiResponse(responseCode = "404", description = "Appointment not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PatchMapping("/{appointmentId}/no-show")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<AppointmentResponse>> markNoShow(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Appointment ID to mark as no-show") @PathVariable String appointmentId
    ) {
        var response = appointmentService.markNoShow(appointmentId, userId);
        return ResponseUtil.ok("Appointment marked as no-show successfully!", response);
    }

    @Operation(
            summary = "Get patient appointment history",
            description = "Returns paginated appointment history for the authenticated patient"
    )
    @ApiResponse(responseCode = "200", description = "History fetched successfully")
    @GetMapping("/patient/history")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<Map<String, Object>>> getPatientHistory(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "0-based page number", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AppointmentResponse> responses = appointmentService.getPatientHistory(userId, page, size);
        return ResponseUtil.paginated("Patient's history fetched successfully!", responses);
    }

    @Operation(
            summary = "Get doctor's today appointments",
            description = "Returns all appointments scheduled for today for the authenticated doctor"
    )
    @ApiResponse(responseCode = "200", description = "Today's appointments fetched successfully")
    @GetMapping("/doctor/today")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<List<AppointmentResponse>>> getDoctorTodayAppointments(
            @AuthenticationPrincipal String userId
    ) {
        var response = appointmentService.getDoctorTodayAppointments(userId);
        return ResponseUtil.ok("Today's appointments fetched successfully!", response);
    }

    @Operation(
            summary = "Get doctor appointment history",
            description = "Returns paginated appointment history for the authenticated doctor"
    )
    @ApiResponse(responseCode = "200", description = "History fetched successfully")
    @GetMapping("/doctor/history")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<Map<String, Object>>> getDoctorHistory(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "0-based page number", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AppointmentResponse> result = appointmentService.getDoctorHistory(userId, page, size);
        return ResponseUtil.paginated("Doctor's history fetched successfully", result);
    }
}