import React from "react";
import {
  GENDER_LABELS,
  SPECIALIZATION_LABELS,
  type DoctorGender,
  type Specialization,
} from "../../types/doctor.types";

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

interface DoctorDisplayFieldsProps {
  profile?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string | null;
    dateOfBirth?: string | null;
    gender?: DoctorGender | null;
    specialization?: Specialization | null;
    qualification?: string | null;
    yearsOfExperience?: number | null;
    languagesSpoken?: string[];
    bio?: string | null;
  };
}

const DoctorDisplayFields: React.FC<DoctorDisplayFieldsProps> = ({
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
        label="Specialization"
        value={
          profile?.specialization
            ? SPECIALIZATION_LABELS[profile.specialization]
            : null
        }
      />
      <DisplayField label="Qualification" value={profile?.qualification} />
      <DisplayField
        label="Years of Experience"
        value={
          profile?.yearsOfExperience != null
            ? `${profile.yearsOfExperience} years`
            : null
        }
      />
      <DisplayField
        label="Languages Spoken"
        value={profile?.languagesSpoken?.join(", ") || null}
      />
      {profile?.bio && (
        <div className="sm:col-span-2">
          <p className="text-xs text-gray-400 mb-1">Bio</p>
          <p className="text-sm text-gray-100 leading-relaxed">{profile.bio}</p>
        </div>
      )}
    </div>
  );
};

export default DoctorDisplayFields;
