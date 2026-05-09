import React from "react";
import { FieldErrorMessage } from "../../../../shared/components/ui/FieldErrorMessage";
import {
  GENDER_LABELS,
  SPECIALIZATION_LABELS,
  type DoctorGender,
  type Specialization,
  type UpdateDoctorProfileRequest,
} from "../../types/doctor.types";

interface DoctorEditFormProps {
  form: UpdateDoctorProfileRequest & { languagesText?: string };
  fieldErrors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

const inputClass =
  "w-full px-4 py-2.5 border border-gray-600 rounded-lg text-sm text-white bg-gray-800/50 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-500";

const labelClass = "block text-xs font-medium text-gray-300 mb-2";

const DoctorEditForm: React.FC<DoctorEditFormProps> = ({
  form,
  fieldErrors,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* First Name */}
      <div>
        <label className={labelClass}>First Name</label>
        <input
          name="firstName"
          value={form.firstName ?? ""}
          onChange={onChange}
          className={inputClass}
        />
        <FieldErrorMessage message={fieldErrors.firstName} />
      </div>

      {/* Last Name */}
      <div>
        <label className={labelClass}>Last Name</label>
        <input
          name="lastName"
          value={form.lastName ?? ""}
          onChange={onChange}
          className={inputClass}
        />
        <FieldErrorMessage message={fieldErrors.lastName} />
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>Email</label>
        <input
          name="email"
          type="email"
          value={form.email ?? ""}
          onChange={onChange}
          className={inputClass}
        />
        <FieldErrorMessage message={fieldErrors.email} />
      </div>

      {/* Date of Birth */}
      <div>
        <label className={labelClass}>Date of Birth</label>
        <input
          name="dateOfBirth"
          type="date"
          value={form.dateOfBirth ?? ""}
          onChange={onChange}
          className={inputClass}
        />
        <FieldErrorMessage message={fieldErrors.dateOfBirth} />
      </div>

      {/* Gender */}
      <div>
        <label className={labelClass}>Gender</label>
        <select
          name="gender"
          value={form.gender ?? ""}
          onChange={onChange}
          className={inputClass}
        >
          <option value="" className="bg-gray-800 text-gray-300">
            Select gender
          </option>
          {(Object.keys(GENDER_LABELS) as DoctorGender[]).map((g) => (
            <option key={g} value={g} className="bg-gray-800 text-white">
              {GENDER_LABELS[g]}
            </option>
          ))}
        </select>
        <FieldErrorMessage message={fieldErrors.gender} />
      </div>

      {/* Specialization */}
      <div>
        <label className={labelClass}>Specialization</label>
        <select
          name="specialization"
          value={form.specialization ?? ""}
          onChange={onChange}
          className={inputClass}
        >
          <option value="" className="bg-gray-800 text-gray-300">
            Select specialization
          </option>
          {(Object.keys(SPECIALIZATION_LABELS) as Specialization[]).map((s) => (
            <option key={s} value={s} className="bg-gray-800 text-white">
              {SPECIALIZATION_LABELS[s]}
            </option>
          ))}
        </select>
        <FieldErrorMessage message={fieldErrors.specialization} />
      </div>

      {/* Qualification */}
      <div>
        <label className={labelClass}>Qualification</label>
        <input
          name="qualification"
          value={form.qualification ?? ""}
          onChange={onChange}
          placeholder="e.g. MBBS, MD"
          className={inputClass}
        />
        <FieldErrorMessage message={fieldErrors.qualification} />
      </div>

      {/* Years of Experience */}
      <div>
        <label className={labelClass}>Years of Experience</label>
        <input
          name="yearsOfExperience"
          type="number"
          min={0}
          max={60}
          value={form.yearsOfExperience ?? ""}
          onChange={onChange}
          className={inputClass}
        />
        <FieldErrorMessage message={fieldErrors.yearsOfExperience} />
      </div>

      {/* Languages Spoken */}
      <div className="sm:col-span-2">
        <label className={labelClass}>
          Languages Spoken{" "}
          <span className="text-gray-500 font-normal">(comma-separated)</span>
        </label>
        <input
          name="languagesText"
          value={(form as any).languagesText ?? ""}
          onChange={onChange}
          placeholder="e.g. English, Hindi"
          className={inputClass}
        />
      </div>

      {/* Bio */}
      <div className="sm:col-span-2">
        <label className={labelClass}>
          Bio <span className="text-gray-500 font-normal">(max 250 chars)</span>
        </label>
        <textarea
          name="bio"
          value={form.bio ?? ""}
          onChange={onChange}
          rows={3}
          maxLength={250}
          className={`${inputClass} resize-none`}
        />
        <FieldErrorMessage message={fieldErrors.bio} />
      </div>
    </div>
  );
};

export default DoctorEditForm;
