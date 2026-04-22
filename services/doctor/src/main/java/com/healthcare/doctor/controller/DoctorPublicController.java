package com.healthcare.doctor.controller;

import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.payload.dto.success.ResponseWrapper;
import com.healthcare.doctor.payload.response.DoctorPublicResponse;
import com.healthcare.doctor.service.DoctorService;
import com.healthcare.doctor.util.ResponseUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(
        name = "Browse Doctor's",
        description = "Endpoints for browsing doctor's profile"
)
@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
public class DoctorPublicController {

    private final DoctorService doctorService;

    @GetMapping("/search")
    public ResponseEntity<ResponseWrapper<Map<String, Object>>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal maxFees,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<DoctorPublicResponse> result = doctorService.search(
                name, specialization, city, maxFees, page, size
        );

        // Only include filters that were actually provided
        Map<String, Object> filters = new HashMap<>();
        if (StringUtils.hasText(name)) filters.put("name", name);
        if (StringUtils.hasText(specialization)) filters.put("specialization", specialization);
        if (StringUtils.hasText(city)) filters.put("city", city);
        if (maxFees != null) filters.put("maxFees", maxFees);

        return ResponseUtil.paginatedWithFilters(
                "Doctors found successfully", result, filters
        );
    }

    @GetMapping("/{doctorId}/public")
    public ResponseEntity<ResponseWrapper<DoctorPublicResponse>> getDoctorPublicProfile(
            @PathVariable String doctorId
    ) {

        var response = doctorService.getPublicProfile(doctorId);

        return ResponseUtil.ok("Doctor profile retrieved successfully", response);
    }

}