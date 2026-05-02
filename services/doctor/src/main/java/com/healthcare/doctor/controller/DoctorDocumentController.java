package com.healthcare.doctor.controller;

import com.healthcare.doctor.enums.DocumentType;
import com.healthcare.doctor.payload.dto.success.ResponseWrapper;
import com.healthcare.doctor.payload.response.DoctorDocumentResponse;
import com.healthcare.doctor.service.DoctorDocumentService;
import com.healthcare.doctor.util.ResponseUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Doctor Documents", description = "Endpoints for managing doctor verification documents")
@RestController
@RequestMapping("/api/doctor/documents")
@RequiredArgsConstructor
@ApiResponses({
        @ApiResponse(responseCode = "401", description = "Unauthorized — missing or invalid token",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "403", description = "Forbidden — ROLE_DOCTOR required",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse"))),
        @ApiResponse(responseCode = "500", description = "Unexpected server error",
                content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
})
public class DoctorDocumentController {

    private final DoctorDocumentService documentService;

    @Operation(
            summary = "Upload verification document",
            description = "Uploads a verification document (e.g. MEDICAL_LICENSE) to Cloudinary. " +
                    "Replaces an existing document of the same type if already uploaded."
    )
    @ApiResponse(responseCode = "200", description = "Document uploaded successfully")
    @ApiResponse(responseCode = "400", description = "File is empty or document type is invalid",
            content = @Content(schema = @Schema(ref = "#/components/schemas/ErrorResponse")))
    @PatchMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<DoctorDocumentResponse>> uploadDocument(
            @AuthenticationPrincipal String userId,
            @Parameter(description = "Type of document being uploaded e.g. MEDICAL_LICENSE")
            @RequestParam("documentType") DocumentType documentType,
            @Parameter(description = "Document file (PDF or image)")
            @RequestParam("file") MultipartFile file
    ) {
        var response = documentService.uploadDocument(userId, documentType, file);
        return ResponseUtil.ok("Document uploaded successfully", response);
    }
}