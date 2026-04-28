package com.healthcare.doctor.service.impl;

import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.entity.DoctorDocument;
import com.healthcare.doctor.enums.DocumentType;
import com.healthcare.doctor.enums.ErrorCode;
import com.healthcare.doctor.exception.CloudinaryException;
import com.healthcare.doctor.mapper.DoctorDocumentMapper;
import com.healthcare.doctor.payload.response.DoctorDocumentResponse;
import com.healthcare.doctor.repository.DoctorDocumentRepository;
import com.healthcare.doctor.service.CloudinaryService;
import com.healthcare.doctor.service.DoctorDocumentService;
import com.healthcare.doctor.service.DoctorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorDocumentServiceImpl implements DoctorDocumentService {

    private final DoctorService doctorService;
    private final CloudinaryService cloudinaryService;
    private final DoctorDocumentRepository documentRepository;

    @Override
    @Transactional
    public DoctorDocumentResponse uploadDocument(String userId, DocumentType documentType, MultipartFile file) {
        log.info("Document upload initiated. userId={}, documentType={}, fileSize={} bytes",
                userId, documentType, file.getSize());

        if (file.isEmpty()) {
            throw new CloudinaryException(ErrorCode.NO_FILE_PROVIDED);
        }

        Doctor doctor = doctorService.findByUserId(userId);

        Map<String, String> cloudinaryResponse = cloudinaryService.uploadDocument(
                doctor.getId(), documentType, file
        );

        String url = cloudinaryResponse.get("url");
        String publicId = cloudinaryResponse.get("public_id");

        // Upsert: replace existing document of same type if present
        Optional<DoctorDocument> existing = documentRepository
                .findByDoctorIdAndDocumentType(doctor.getId(), documentType);

        DoctorDocument document = existing.orElseGet(() -> DoctorDocument.builder()
                .doctor(doctor)
                .documentType(documentType)
                .build());

        document.setDocumentUrl(url);
        document.setCloudinaryPublicId(publicId);

        documentRepository.save(document);

        log.info("Document saved. doctorId={}, documentType={}, publicId={}",
                doctor.getId(), documentType, publicId);

        return DoctorDocumentMapper.toResponse(document);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorDocumentResponse> getDocuments(String doctorId) {
        return documentRepository.findByDoctorId(doctorId)
                .stream()
                .map(DoctorDocumentMapper::toResponse)
                .toList();
    }
}