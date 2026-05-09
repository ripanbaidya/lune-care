package com.healthcare.doctor.controller;

import com.healthcare.doctor.config.RedisCacheConfig;
import com.healthcare.doctor.payload.dto.success.ResponseWrapper;
import com.healthcare.doctor.payload.response.DoctorPublicResponse;
import com.healthcare.doctor.service.DoctorService;
import com.healthcare.doctor.util.ResponseUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "Browse Doctors", description = "Public endpoints for searching and viewing doctor profiles")
@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
@ApiResponses({
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
public class DoctorPublicController {

    private final DoctorService doctorService;

    @Operation(
            summary = "Search doctors",
            description = "Paginated search across active doctors. Supports filtering by name, " +
                    "specialization, city, and max consultation fees. All filters are optional."
    )
    @ApiResponse(responseCode = "200", description = "Doctors fetched successfully")
    @GetMapping("/search")
    @Cacheable(
            cacheNames = RedisCacheConfig.DOCTOR_SEARCH_CACHE,
            keyGenerator = "doctorSearchKeyGenerator"
    )
    public ResponseEntity<ResponseWrapper<Map<String, Object>>> search(
            @Parameter(description = "Partial or full doctor name") @RequestParam(required = false) String name,
            @Parameter(description = "Specialization enum value e.g. CARDIOLOGY") @RequestParam(required = false) String specialization,
            @Parameter(description = "City name to filter by") @RequestParam(required = false) String city,
            @Parameter(description = "Maximum consultation fees in INR") @RequestParam(required = false) BigDecimal maxFees,
            @Parameter(description = "0-based page number", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10") @RequestParam(defaultValue = "10") int size
    ) {
        Page<DoctorPublicResponse> result = doctorService.search(name, specialization, city, maxFees, page, size);

        Map<String, Object> filters = new HashMap<>();
        if (StringUtils.hasText(name)) filters.put("name", name);
        if (StringUtils.hasText(specialization)) filters.put("specialization", specialization);
        if (StringUtils.hasText(city)) filters.put("city", city);
        if (maxFees != null) filters.put("maxFees", maxFees);

        return ResponseUtil.paginatedWithFilters("Doctors found successfully", result, filters);
    }

    @Operation(
            summary = "Get doctor public profile",
            description = "Returns the public-facing profile of a doctor including clinics and schedule"
    )
    @ApiResponse(responseCode = "200", description = "Doctor profile retrieved successfully")
    @ApiResponse(responseCode = "404", description = "Doctor not found",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @GetMapping("/{doctorId}/public")
    public ResponseEntity<ResponseWrapper<DoctorPublicResponse>> getDoctorPublicProfile(
            @Parameter(description = "Doctor's profile ID") @PathVariable String doctorId
    ) {
        var response = doctorService.getPublicProfile(doctorId);
        return ResponseUtil.ok("Doctor profile retrieved successfully", response);
    }
}
