package com.healthcare.doctor.controller;

import com.healthcare.doctor.enums.DocumentType;
import com.healthcare.doctor.payload.dto.success.ResponseWrapper;
import com.healthcare.doctor.payload.response.DoctorDocumentResponse;
import com.healthcare.doctor.service.DoctorDocumentService;
import com.healthcare.doctor.util.ResponseUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(
        name = "Doctor Documents",
        description = "Endpoints for managing doctor verification documents"
)
@RestController
@RequestMapping("/api/doctor/documents")
@RequiredArgsConstructor
public class DoctorDocumentController {

    private final DoctorDocumentService documentService;

    @PatchMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<ResponseWrapper<DoctorDocumentResponse>> uploadDocument(
            @AuthenticationPrincipal String userId,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam("file") MultipartFile file
    ) {
        var response = documentService.uploadDocument(userId, documentType, file);
        return ResponseUtil.ok("Document uploaded successfully", response);
    }
}