package com.healthcare.doctor.controller;

import com.healthcare.doctor.payload.dto.success.ResponseWrapper;
import com.healthcare.doctor.payload.request.ClinicScheduleRequest;
import com.healthcare.doctor.payload.response.ClinicScheduleResponse;
import com.healthcare.doctor.service.ClinicScheduleService;
import com.healthcare.doctor.util.ResponseUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@Tag(name = "Clinic Scheduler", description = "Endpoints for managing clinic weekly schedules")
@RestController
@RequestMapping("/api/doctor/clinics/{clinicId}/schedule")
@RequiredArgsConstructor
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Unauthorized — missing or invalid token",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "403", description = "Forbidden — ROLE_DOCTOR required",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
public class ClinicScheduleController {

    private final ClinicScheduleService scheduleService;

    @Operation(
            summary = "Set clinic schedule",
            description = "Defines the weekly schedule for a clinic and triggers slot generation " +
                    "for the given date range"
    )
    @ApiResponse(responseCode = "200", description = "Schedule set successfully")
    @ApiResponse(responseCode = "400", description = "Validation failed",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @ApiResponse(responseCode = "404", description = "Clinic not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<List<ClinicScheduleResponse>>> setSchedule(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Clinic ID to set schedule for") @PathVariable String clinicId,
            @Valid @RequestBody ClinicScheduleRequest request
    ) {
        var response = scheduleService.setSchedule(userId, clinicId, request);
        return ResponseUtil.ok("Clinic schedule set successfully!", response);
    }

    @Operation(
            summary = "Get clinic schedule",
            description = "Returns all active and inactive schedule entries for the given clinic"
    )
    @ApiResponse(responseCode = "200", description = "Schedule fetched successfully")
    @ApiResponse(responseCode = "404", description = "Clinic not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<List<ClinicScheduleResponse>>> getSchedule(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Clinic ID") @PathVariable String clinicId
    ) {
        return ResponseUtil.ok(
                "Schedules fetched successfully for Clinic!",
                scheduleService.getSchedule(userId, clinicId)
        );
    }

    @Operation(
            summary = "Update clinic schedule",
            description = "Replaces the existing schedule entries and regenerates slots for the date range"
    )
    @ApiResponse(responseCode = "200", description = "Schedule updated successfully")
    @ApiResponse(responseCode = "400", description = "Validation failed",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @ApiResponse(responseCode = "404", description = "Clinic not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PutMapping
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<List<ClinicScheduleResponse>>> updateSchedule(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Clinic ID") @PathVariable String clinicId,
            @Valid @RequestBody ClinicScheduleRequest request
    ) {
        var response = scheduleService.setSchedule(userId, clinicId, request);
        return ResponseUtil.ok("Clinic schedule updated successfully!", response);
    }

    @Operation(
            summary = "Delete a schedule day",
            description = "Removes a specific day from the clinic schedule and cancels all " +
                    "available future slots for that day"
    )
    @ApiResponse(responseCode = "204", description = "Schedule day deleted successfully")
    @ApiResponse(responseCode = "404", description = "Clinic or schedule entry not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @DeleteMapping("/{dayOfWeek}")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<Void> deleteScheduleDay(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Clinic ID") @PathVariable String clinicId,
            @Parameter(description = "Day to remove e.g. MONDAY") @PathVariable DayOfWeek dayOfWeek
    ) {
        scheduleService.deleteScheduleDay(userId, clinicId, dayOfWeek);
        return ResponseEntity.noContent().build();
    }
}