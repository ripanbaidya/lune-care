package com.healthcare.doctor.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.healthcare.doctor.enums.DocumentType;
import com.healthcare.doctor.enums.ErrorCode;
import com.healthcare.doctor.exception.CloudinaryException;
import com.healthcare.doctor.service.CloudinaryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    private static final String DOCTOR_PROFILE_PHOTO_FOLDER = "lune-care/doctors/profile-photos";
    private static final String DOCTOR_DOCUMENTS_FOLDER = "lune-care/doctors/documents";
    private static final String PUBLIC_ID = "public_id";

    private final Cloudinary cloudinary;

    public CloudinaryServiceImpl(Optional<Cloudinary> cloudinary) {
        this.cloudinary = cloudinary.orElse(null);
    }

    public Cloudinary getCloudinary() {
        if (cloudinary == null) {
            log.error("Cloudinary is not configured or disabled. Unable to upload files.");
            throw new CloudinaryException(ErrorCode.PHOTO_UPLOAD_FAILED,
                    "Cloudinary is not configured or disabled. Unable to upload files.");
        }
        return cloudinary;
    }

    @Override
    public Map<String, String> uploadPhoto(String doctorId, MultipartFile file) {
        log.info("Initiating Cloudinary upload. doctorId={}, fileSize={} bytes",
                doctorId, file.getSize());

        try {
            Transformation transformation = new Transformation()
                    .width(400)
                    .height(400)
                    .crop("fill")
                    .gravity("face");

            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            PUBLIC_ID, doctorId,
                            "folder", DOCTOR_PROFILE_PHOTO_FOLDER,
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
            log.error("IO Error during Cloudinary upload for doctor {}: {}", doctorId, e.getMessage(), e);
            throw new CloudinaryException(ErrorCode.PHOTO_UPLOAD_FAILED);
        } catch (Exception e) {
            log.error("Unexpected Cloudinary API error for doctor {}: {}", doctorId, e.getMessage(), e);
            throw new CloudinaryException(ErrorCode.PHOTO_UPLOAD_FAILED);
        }
    }

    @Override
    public Map<String, String> uploadDocument(String doctorId, DocumentType documentType, MultipartFile file) {
        String publicId = doctorId + "_" + documentType.name().toLowerCase();

        log.info("Initiating Cloudinary document upload. doctorId={}, documentType={}, fileSize={} bytes",
                doctorId, documentType, file.getSize());

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            PUBLIC_ID, publicId,
                            "folder", DOCTOR_DOCUMENTS_FOLDER,
                            "overwrite", true,
                            "resource_type", "auto" // supports pdf + images
                    )
            );

            String uploadedPublicId = (String) result.get(PUBLIC_ID);
            String url = (String) result.get("secure_url");

            log.info("Cloudinary document upload successful. publicId={}, url={}", uploadedPublicId, url);

            return Map.of(PUBLIC_ID, uploadedPublicId, "url", url);

        } catch (IOException e) {
            log.error("IO Error during Cloudinary document upload for doctor {}: {}", doctorId, e.getMessage(), e);
            throw new CloudinaryException(ErrorCode.PHOTO_UPLOAD_FAILED);
        } catch (Exception e) {
            log.error("Unexpected Cloudinary API error during document upload for doctor {}: {}", doctorId, e.getMessage(), e);
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
