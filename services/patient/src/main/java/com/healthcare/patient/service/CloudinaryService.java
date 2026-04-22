package com.healthcare.patient.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface CloudinaryService {

    Map<String, String> uploadPhoto(String patientId, MultipartFile file);

    void deletePhoto(String publicId);
}
