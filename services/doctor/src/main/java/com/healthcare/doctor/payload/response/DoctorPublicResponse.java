package com.healthcare.doctor.payload.response;

import com.healthcare.doctor.enums.Specialization;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.util.List;

@Schema(description = "Public doctor profile visible to patients during search")
@Builder
public record DoctorPublicResponse(

        @Schema(description = "Doctor's internal profile ID")
        String id,

        @Schema(description = "Linked auth-service user ID")
        String userId,

        @Schema(description = "First name")
        String firstName,

        @Schema(description = "Last name")
        String lastName,

        @Schema(description = "Cloudinary URL for profile photo")
        String profilePhotoUrl,

        @Schema(description = "Medical specialization")
        Specialization specialization,

        @Schema(description = "Highest qualification")
        String qualification,

        @Schema(description = "Years of clinical experience")
        Integer yearsOfExperience,

        @Schema(description = "Short professional bio")
        String bio,

        @Schema(description = "Languages the doctor can consult in")
        List<String> languagesSpoken,

        @Schema(description = "List of clinics associated with the doctor")
        List<ClinicResponse> clinics
) {
}