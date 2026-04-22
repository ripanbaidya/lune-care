package com.healthcare.doctor.controller;

import com.healthcare.doctor.payload.dto.success.ResponseWrapper;
import com.healthcare.doctor.payload.request.ClinicScheduleRequest;
import com.healthcare.doctor.payload.response.ClinicScheduleResponse;
import com.healthcare.doctor.service.ClinicService;
import com.healthcare.doctor.util.ResponseUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Clinic Schedular",
        description = "Endpoints for doctor clinic schedular"
)
@RestController
@RequestMapping("/api/doctor/clinics/{clinicId}/schedule")
@RequiredArgsConstructor
public class ClinicScheduleController {

    private final ClinicService clinicService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<List<ClinicScheduleResponse>>> setSchedule(
            @AuthenticationPrincipal String userId,
            @PathVariable String clinicId,
            @Valid @RequestBody ClinicScheduleRequest request
    ) {
        var response = clinicService.setSchedule(userId, clinicId, request);
        return ResponseUtil.ok("Clinic schedule set successfully!", response);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<List<ClinicScheduleResponse>>> getSchedule(
            @AuthenticationPrincipal String userId,
            @PathVariable String clinicId
    ) {
        return ResponseUtil.ok(
                "Schedule's fetched successfully for Clinic!",
                clinicService.getSchedule(userId, clinicId)
        );
    }

    // TODO: Verify the updateSchedule, It should be update the schedule for a specific Schedule
    @PutMapping
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<List<ClinicScheduleResponse>>> updateSchedule(
            @AuthenticationPrincipal String userId,
            @PathVariable String clinicId,
            @Valid @RequestBody ClinicScheduleRequest request
    ) {
        // Update is identical to set — replaces all schedules atomically
        var response = clinicService.setSchedule(userId, clinicId, request);

        return ResponseUtil.ok("Clinic Schedule Updated Successfully!", response);
    }
}