package com.healthcare.patient.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.healthcare.patient.enums.ErrorCode;
import com.healthcare.patient.exception.CloudinaryException;
import com.healthcare.patient.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private static final String PATIENT_FOLDER = "lune-care/patients";
    private static final String PUBLIC_ID = "public_id";

    private final Cloudinary cloudinary;

    @Override
    public Map<String, String> uploadPhoto(String patientId, MultipartFile file) {
        // String publicId = PATIENT_FOLDER + "/profile-photos" + "/" + patientId;

        try {
            Transformation transformation = new Transformation()
                    .width(400)
                    .height(400)
                    .crop("fill")
                    .gravity("face");

            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            PUBLIC_ID, patientId,
                            "folder", PATIENT_FOLDER + "/profile-photos",
                            "overwrite", true,
                            "resource_type", "image",
                            "transformation", transformation
                    )
            );

            return Map.of(
                    PUBLIC_ID, (String) result.get(PUBLIC_ID),
                    "url", (String) result.get("secure_url")
            );
        } catch (IOException e) {
            log.error("Error uploading file for patient {}: {}", patientId, e.getMessage());
            throw new CloudinaryException(ErrorCode.PHOTO_UPLOAD_FAILED);
        }
    }

    @Override
    public void deletePhoto(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.error("Error deleting file with public_id {}: {}", publicId, e.getMessage());
        }
    }
}
