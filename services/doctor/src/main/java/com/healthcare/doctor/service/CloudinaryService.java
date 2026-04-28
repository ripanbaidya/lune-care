package com.healthcare.doctor.service;

import com.healthcare.doctor.enums.DocumentType;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface CloudinaryService {

    Map<String, String> uploadPhoto(String doctorId, MultipartFile file);

    Map<String, String> uploadDocument(String doctorId, DocumentType documentType, MultipartFile file);

    void deletePhoto(String publicId);
}
