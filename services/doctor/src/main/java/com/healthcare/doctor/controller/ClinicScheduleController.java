package com.healthcare.doctor.controller;

import com.healthcare.doctor.payload.dto.success.ResponseWrapper;
import com.healthcare.doctor.payload.request.ClinicScheduleRequest;
import com.healthcare.doctor.payload.response.ClinicScheduleResponse;
import com.healthcare.doctor.service.ClinicScheduleService;
import com.healthcare.doctor.util.ResponseUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@Tag(
        name = "Clinic Schedular",
        description = "Endpoints for doctor clinic schedular"
)
@RestController
@RequestMapping("/api/doctor/clinics/{clinicId}/schedule")
@RequiredArgsConstructor
public class ClinicScheduleController {

    private final ClinicScheduleService scheduleService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<List<ClinicScheduleResponse>>> setSchedule(
            @AuthenticationPrincipal String userId,
            @PathVariable String clinicId,
            @Valid @RequestBody ClinicScheduleRequest request
    ) {
        var response = scheduleService.setSchedule(userId, clinicId, request);
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
                scheduleService.getSchedule(userId, clinicId)
        );
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<List<ClinicScheduleResponse>>> updateSchedule(
            @AuthenticationPrincipal String userId,
            @PathVariable String clinicId,
            @Valid @RequestBody ClinicScheduleRequest request
    ) {
        var response = scheduleService.setSchedule(userId, clinicId, request);
        return ResponseUtil.ok("Clinic schedule updated successfully!", response);
    }

    @DeleteMapping("/{dayOfWeek}")
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<Void> deleteScheduleDay(
            @AuthenticationPrincipal String userId,
            @PathVariable String clinicId,
            @PathVariable DayOfWeek dayOfWeek
    ) {
        scheduleService.deleteScheduleDay(userId, clinicId, dayOfWeek);
        return ResponseEntity.noContent().build();
    }
}