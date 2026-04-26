package com.healthcare.patient.controller;

import com.healthcare.patient.payload.dto.success.ResponseWrapper;
import com.healthcare.patient.payload.request.AddressRequest;
import com.healthcare.patient.payload.response.AddressResponse;
import com.healthcare.patient.service.AddressService;
import com.healthcare.patient.util.ResponseUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(
        name = "Patient Address",
        description = "Endpoints for managing patient addresses"
)
@RestController
@RequestMapping("/api/patient/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<AddressResponse>> createAddress(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody AddressRequest request
    ) {
        var response = addressService.createAddress(userId, request);
        return ResponseUtil.ok("Address saved successfully!", response);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<AddressResponse>> getAddress(
            @AuthenticationPrincipal String userId) {

        var response = addressService.getAddress(userId);
        return ResponseUtil.ok("Address fetched successfully!", response);
    }

    @PatchMapping
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<AddressResponse>> updateAddress(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody AddressRequest request
    ) {
        var response = addressService.updateAddress(userId, request);
        return ResponseUtil.ok("Address updated successfully!", response);

    }

    @DeleteMapping
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<Void> removePhoto(
            @AuthenticationPrincipal String userId
    ) {
        addressService.deleteAddress(userId);
        return ResponseUtil.noContent();
    }
}