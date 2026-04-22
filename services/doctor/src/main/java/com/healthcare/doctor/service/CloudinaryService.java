package com.healthcare.doctor.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface CloudinaryService {

    Map<String, String> uploadPhoto(String doctorId, MultipartFile file);

    void deletePhoto(String publicId);
}
