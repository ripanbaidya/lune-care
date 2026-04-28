package com.healthcare.doctor.service;

import com.healthcare.doctor.enums.DocumentType;
import com.healthcare.doctor.payload.response.DoctorDocumentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DoctorDocumentService {

    /**
     * Uploads a verification document for the authenticated doctor.
     * If a document of the same type already exists, it is replaced (overwritten in Cloudinary,
     * updated in the database).
     *
     * @param userId       the authenticated doctor's userId
     * @param documentType the type of document being uploaded
     * @param file         the file to upload
     * @return response containing document metadata
     */
    DoctorDocumentResponse uploadDocument(String userId, DocumentType documentType, MultipartFile file);

    /**
     * Returns all documents uploaded by the given doctor.
     * Used by admin-service internally to review submitted documents.
     *
     * @param doctorId the doctor entity ID (not userId)
     * @return list of uploaded documents
     */
    List<DoctorDocumentResponse> getDocuments(String doctorId);
}