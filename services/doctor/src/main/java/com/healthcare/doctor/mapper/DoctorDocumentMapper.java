package com.healthcare.doctor.mapper;

import com.healthcare.doctor.entity.DoctorDocument;
import com.healthcare.doctor.payload.response.DoctorDocumentResponse;

public final class DoctorDocumentMapper {

    private DoctorDocumentMapper() {
    }

    public static DoctorDocumentResponse toResponse(DoctorDocument document) {
        return DoctorDocumentResponse.builder()
                .id(document.getId())
                .documentType(document.getDocumentType())
                .documentUrl(document.getDocumentUrl())
                .uploadedAt(document.getUploadedAt())
                .build();
    }
}