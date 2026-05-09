import React, { useState, useEffect } from "react";
import {
  useDoctorProfile,
  useUpdateDoctorProfile,
  useUploadDoctorPhoto,
  useRemoveDoctorPhoto,
} from "../hooks/useDoctorProfile";
import { FormError } from "../../../shared/components/ui/FormError";
import Spinner from "../../../shared/components/ui/Spinner";
import { type UpdateDoctorProfileRequest } from "../types/doctor.types";
import { AppError } from "../../../shared/utils/errorParser";
import { toast } from "sonner";

import ProfileHeader from "../../../features/patient/components/profile/ProfileHeader";
import ProfilePhotoSection from "../../../features/patient/components/profile/ProfilePhotoSection";

import DoctorDisplayFields from "../components/profile/DoctorDisplayFields";
import DoctorEditForm from "../components/profile/DoctorEditForm";

const DoctorProfilePage: React.FC = () => {
  const { data: profileRes, isLoading } = useDoctorProfile();
  const { mutate: updateProfile, isPending: isUpdating } =
    useUpdateDoctorProfile();
  const { mutate: uploadPhoto, isPending: isUploading } =
    useUploadDoctorPhoto();
  const { mutate: removePhoto, isPending: isRemoving } = useRemoveDoctorPhoto();

  const profile = profileRes?.data;
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<
    UpdateDoctorProfileRequest & { languagesText?: string }
  >({});

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email ?? "",
        gender: profile.gender ?? undefined,
        dateOfBirth: profile.dateOfBirth ?? "",
        specialization: profile.specialization ?? undefined,
        qualification: profile.qualification ?? "",
        yearsOfExperience: profile.yearsOfExperience ?? undefined,
        bio: profile.bio ?? "",
        languagesText: profile.languagesSpoken?.join(", ") ?? "",
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value || undefined }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = () => {
    setFormError(null);
    setFieldErrors({});

    const { languagesText, ...rest } = form;
    const payload: UpdateDoctorProfileRequest = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== "" && v !== undefined),
    ) as UpdateDoctorProfileRequest;

    if (languagesText?.trim()) {
      payload.languagesSpoken = languagesText
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);
    }

    if (form.yearsOfExperience !== undefined) {
      payload.yearsOfExperience = Number(form.yearsOfExperience);
    }

    updateProfile(payload, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      },
      onError: (err: AppError) => {
        if (err.isValidation) setFieldErrors(err.toFieldErrorMap());
        else setFormError(err.message);
      },
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadPhoto(file, {
      onSuccess: () => toast.success("Photo updated"),
      onError: (err: AppError) => toast.error(err.message),
    });
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    removePhoto(undefined, {
      onSuccess: () => toast.success("Photo removed"),
      onError: (err: AppError) => toast.error(err.message),
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormError(null);
    setFieldErrors({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProfileHeader
        isEditing={isEditing}
        isUpdating={isUpdating}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
      />

      <ProfilePhotoSection
        profilePhotoUrl={profile?.profilePhotoUrl}
        isUploading={isUploading}
        isRemoving={isRemoving}
        onPhotoChange={handlePhotoChange}
        onRemovePhoto={handleRemovePhoto}
      />

      {/* Personal Info Card */}
      <div className="rounded-2xl border border-gray-800/60 bg-gray-900/40 backdrop-blur-md px-6 py-6">
        <p className="text-sm font-semibold text-gray-300 mb-5">
          Professional Information
        </p>

        <FormError error={formError} className="mb-5" />

        {isEditing ? (
          <DoctorEditForm
            form={form}
            fieldErrors={fieldErrors}
            onChange={handleChange}
          />
        ) : (
          <DoctorDisplayFields profile={profile} />
        )}
      </div>
    </div>
  );
};

export default DoctorProfilePage;
