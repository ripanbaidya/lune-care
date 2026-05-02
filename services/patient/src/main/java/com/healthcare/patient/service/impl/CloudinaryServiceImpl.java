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
import java.util.Optional;

@Slf4j
@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    private static final String PATIENT_FOLDER = "lune-care/patients/profile-photos";
    private static final String PUBLIC_ID = "public_id";

    private final Cloudinary cloudinary;

    // It handles the case where cloudinary enabled=false
    public CloudinaryServiceImpl(Optional<Cloudinary> cloudinary) {
        this.cloudinary = cloudinary.orElse(null);
    }

    private Cloudinary getCloudinary() {
        if (cloudinary == null) {
            log.error("Cloudinary is not configured or disabled. Unable to upload files.");
            throw new CloudinaryException(ErrorCode.PHOTO_UPLOAD_FAILED,
                    "Cloudinary is not configured or disabled. Unable to upload files.");
        }
        return cloudinary;
    }

    @Override
    public Map<String, String> uploadPhoto(String patientId, MultipartFile file) {
        log.info("Initiating Cloudinary upload. patientId={}, fileSize={} bytes",
                patientId, file.getSize());

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
                            "folder", PATIENT_FOLDER,
                            "overwrite", true,
                            "resource_type", "image",
                            "transformation", transformation
                    )
            );

            String uploadedPublicId = (String) result.get(PUBLIC_ID);
            String url = (String) result.get("secure_url");

            log.info("Cloudinary upload successful. publicId={}, url={}", uploadedPublicId, url);

            return Map.of(PUBLIC_ID, uploadedPublicId, "url", url);

        } catch (IOException e) {
            log.error("IO Error during Cloudinary upload for patient {}: {}", patientId, e.getMessage(), e);
            throw new CloudinaryException(ErrorCode.PHOTO_UPLOAD_FAILED);
        } catch (Exception e) {
            log.error("Unexpected Cloudinary API error for patient {}: {}", patientId, e.getMessage(), e);
            throw new CloudinaryException(ErrorCode.PHOTO_UPLOAD_FAILED);
        }
    }

    @Override
    public void deletePhoto(String publicId) {
        log.info("Initiating Cloudinary deletion. publicId={}", publicId);
        try {
            // Cloudinary's destroy() returns a result map (e.g., {"result": "ok"} or {"result": "not found"})
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

            String status = (String) result.get("result");
            if ("ok".equals(status)) {
                log.info("Cloudinary file deleted successfully. publicId={}", publicId);
            } else {
                log.warn("Cloudinary delete returned unusual status. publicId={}, status={}", publicId, status);
            }
        } catch (IOException e) {
            log.error("Failed to delete Cloudinary file. publicId={}, error={}", publicId, e.getMessage(), e);
        }
    }
}
