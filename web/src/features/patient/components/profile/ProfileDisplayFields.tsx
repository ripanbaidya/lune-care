import React from "react";
import {
  BLOOD_GROUP_LABELS,
  GENDER_LABELS,
  type BloodGroup,
  type Gender,
} from "../../types/patient.types";

interface DisplayFieldProps {
  label: string;
  value: string | null | undefined;
}

const DisplayField: React.FC<DisplayFieldProps> = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-100">{value || "—"}</p>
  </div>
);

interface ProfileDisplayFieldsProps {
  profile?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string | null;
    dateOfBirth?: string | null;
    gender?: Gender | null;
    bloodGroup?: BloodGroup | null;
  };
}

const ProfileDisplayFields: React.FC<ProfileDisplayFieldsProps> = ({
  profile,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
      <DisplayField label="First Name" value={profile?.firstName} />
      <DisplayField label="Last Name" value={profile?.lastName} />
      <DisplayField label="Phone Number" value={profile?.phoneNumber} />
      <DisplayField label="Email" value={profile?.email} />
      <DisplayField label="Date of Birth" value={profile?.dateOfBirth} />
      <DisplayField
        label="Gender"
        value={profile?.gender ? GENDER_LABELS[profile.gender] : null}
      />
      <DisplayField
        label="Blood Group"
        value={
          profile?.bloodGroup ? BLOOD_GROUP_LABELS[profile.bloodGroup] : null
        }
      />
    </div>
  );
};

export default ProfileDisplayFields;
