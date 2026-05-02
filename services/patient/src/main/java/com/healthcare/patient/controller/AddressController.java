package com.healthcare.patient.controller;

import com.healthcare.patient.payload.dto.success.ResponseWrapper;
import com.healthcare.patient.payload.request.AddressRequest;
import com.healthcare.patient.payload.response.AddressResponse;
import com.healthcare.patient.service.AddressService;
import com.healthcare.patient.util.ResponseUtil;
import io.swagger.v3.oas.annotations.Operation;
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

@Tag(name = "Patient Address", description = "Endpoints for managing patient address")
@RestController
@RequestMapping("/api/patient/addresses")
@RequiredArgsConstructor
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Unauthorized — missing or invalid token",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "403", description = "Forbidden — ROLE_PATIENT required",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
public class AddressController {

    private final AddressService addressService;

    @Operation(
            summary = "Save address",
            description = "Creates a new address for the authenticated patient. " +
                    "Only one address is supported per patient."
    )
    @ApiResponse(responseCode = "200", description = "Address saved successfully")
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<AddressResponse>> createAddress(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody AddressRequest request
    ) {
        var response = addressService.createAddress(userId, request);
        return ResponseUtil.ok("Address saved successfully!", response);
    }

    @Operation(
            summary = "Get address",
            description = "Returns the saved address of the authenticated patient"
    )
    @ApiResponse(responseCode = "200", description = "Address fetched successfully")
    @ApiResponse(responseCode = "404", description = "No address found for this patient",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<AddressResponse>> getAddress(
            @AuthenticationPrincipal String userId
    ) {
        var response = addressService.getAddress(userId);
        return ResponseUtil.ok("Address fetched successfully!", response);
    }

    @Operation(
            summary = "Update address",
            description = "Replaces the existing address of the authenticated patient"
    )
    @ApiResponse(responseCode = "200", description = "Address updated successfully")
    @ApiResponse(responseCode = "404", description = "No address found to update",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PatchMapping
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<ResponseWrapper<AddressResponse>> updateAddress(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody AddressRequest request
    ) {
        var response = addressService.updateAddress(userId, request);
        return ResponseUtil.ok("Address updated successfully!", response);
    }

    @Operation(
            summary = "Delete address",
            description = "Removes the saved address of the authenticated patient"
    )
    @ApiResponse(responseCode = "204", description = "Address deleted successfully")
    @ApiResponse(responseCode = "404", description = "No address found to delete",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @DeleteMapping
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<Void> removeAddress(
            @AuthenticationPrincipal String userId
    ) {
        addressService.deleteAddress(userId);
        return ResponseUtil.noContent();
    }
}