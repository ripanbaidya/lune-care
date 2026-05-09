import React from "react";
import { FieldErrorMessage } from "../../../../shared/components/ui/FieldErrorMessage";
import {
  BLOOD_GROUP_LABELS,
  GENDER_LABELS,
  type BloodGroup,
  type Gender,
  type UpdateProfileRequest,
} from "../../types/patient.types";

interface ProfileEditFormProps {
  form: UpdateProfileRequest;
  fieldErrors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  form,
  fieldErrors,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* First Name */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">
          First Name
        </label>
        <input
          name="firstName"
          value={form.firstName ?? ""}
          onChange={onChange}
          className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-sm text-white bg-gray-800/50 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
        />
        <FieldErrorMessage message={fieldErrors.firstName} />
      </div>

      {/* Last Name */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">
          Last Name
        </label>
        <input
          name="lastName"
          value={form.lastName ?? ""}
          onChange={onChange}
          className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-sm text-white bg-gray-800/50 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
        />
        <FieldErrorMessage message={fieldErrors.lastName} />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">
          Email
        </label>
        <input
          name="email"
          type="email"
          value={form.email ?? ""}
          onChange={onChange}
          className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-sm text-white bg-gray-800/50 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
        />
        <FieldErrorMessage message={fieldErrors.email} />
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">
          Date of Birth
        </label>
        <input
          name="dateOfBirth"
          type="date"
          value={form.dateOfBirth ?? ""}
          onChange={onChange}
          className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-sm text-white bg-gray-800/50 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
        />
        <FieldErrorMessage message={fieldErrors.dateOfBirth} />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">
          Gender
        </label>
        <select
          name="gender"
          value={form.gender ?? ""}
          onChange={onChange}
          className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-sm text-white bg-gray-800/50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
        >
          <option value="" className="bg-gray-800 text-gray-300">
            Select gender
          </option>
          {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
            <option key={g} value={g} className="bg-gray-800 text-white">
              {GENDER_LABELS[g]}
            </option>
          ))}
        </select>
        <FieldErrorMessage message={fieldErrors.gender} />
      </div>

      {/* Blood Group */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">
          Blood Group
        </label>
        <select
          name="bloodGroup"
          value={form.bloodGroup ?? ""}
          onChange={onChange}
          className="w-full px-4 py-2.5 border border-gray-600 rounded-lg text-sm text-white bg-gray-800/50 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
        >
          <option value="" className="bg-gray-800 text-gray-300">
            Select blood group
          </option>
          {(Object.keys(BLOOD_GROUP_LABELS) as BloodGroup[]).map((bg) => (
            <option key={bg} value={bg} className="bg-gray-800 text-white">
              {BLOOD_GROUP_LABELS[bg]}
            </option>
          ))}
        </select>
        <FieldErrorMessage message={fieldErrors.bloodGroup} />
      </div>
    </div>
  );
};

export default ProfileEditForm;
