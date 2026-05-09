import React, { useState, useEffect } from "react";
import {
  usePatientProfile,
  useUpdateProfile,
  useUploadProfilePhoto,
  useRemoveProfilePhoto,
} from "../hooks/usePatientProfile";
import { FormError } from "../../../shared/components/ui/FormError";
import Spinner from "../../../shared/components/ui/Spinner";
import { type UpdateProfileRequest } from "../types/patient.types.ts";
import { AppError } from "../../../shared/utils/errorParser";
import { toast } from "sonner";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfilePhotoSection from "../components/profile/ProfilePhotoSection";
import ProfileEditForm from "../components/profile/ProfileEditForm";
import ProfileDisplayFields from "../components/profile/ProfileDisplayFields";

// Main Page
const PatientProfilePage: React.FC = () => {
  const { data: profileRes, isLoading } = usePatientProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadPhoto, isPending: isUploading } =
    useUploadProfilePhoto();
  const { mutate: removePhoto, isPending: isRemoving } =
    useRemoveProfilePhoto();

  const profile = profileRes?.data;

  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<UpdateProfileRequest>({});

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email ?? "",
        dateOfBirth: profile.dateOfBirth ?? "",
        gender: profile.gender ?? undefined,
        bloodGroup: profile.bloodGroup ?? undefined,
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value || undefined }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = () => {
    setFormError(null);
    setFieldErrors({});

    // Strip empty strings → undefined so backend ignores them
    const payload: UpdateProfileRequest = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== "" && v !== undefined),
    ) as UpdateProfileRequest;

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
    // Reset input so same file can be reselected
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
      {/* Header */}
      <ProfileHeader
        isEditing={isEditing}
        isUpdating={isUpdating}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
      />

      {/* Profile Photo Card */}
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
          Personal Information
        </p>

        <FormError error={formError} className="mb-5" />

        {isEditing ? (
          <ProfileEditForm
            form={form}
            fieldErrors={fieldErrors}
            onChange={handleChange}
          />
        ) : (
          <ProfileDisplayFields profile={profile} />
        )}
      </div>
    </div>
  );
};

export default PatientProfilePage;
