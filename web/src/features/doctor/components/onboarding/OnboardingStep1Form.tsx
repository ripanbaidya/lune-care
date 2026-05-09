import React from "react";
import { ChevronRight } from "lucide-react";
import { FormError } from "../../../../shared/components/ui/FormError";
import { FieldErrorMessage } from "../../../../shared/components/ui/FieldErrorMessage";
import Spinner from "../../../../shared/components/ui/Spinner";
import {
  GENDER_LABELS,
  SPECIALIZATION_LABELS,
  type DoctorGender,
  type Specialization,
} from "../../types/doctor.types";

const inputCls =
  "w-full px-4 py-2.5 border border-gray-600 rounded-lg text-sm text-white bg-gray-800/50 " +
  "placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
  "transition-all duration-200 hover:border-gray-500";

const selectCls =
  "w-full px-4 py-2.5 border border-gray-600 rounded-lg text-sm text-white bg-gray-800/50 " +
  "outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
  "transition-all duration-200 hover:border-gray-500";

const labelCls = "block text-xs font-medium text-gray-300 mb-2";

export interface Step1Form {
  email: string;
  gender: DoctorGender | "";
  dateOfBirth: string;
  specialization: Specialization | "";
  qualification: string;
  yearsOfExperience: string;
  bio: string;
  languagesSpoken: string;
}

interface OnboardingStep1FormProps {
  form: Step1Form;
  formError: string | null;
  fieldErrors: Record<string, string>;
  isPending: boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onSubmit: () => void;
}

const OnboardingStep1Form: React.FC<OnboardingStep1FormProps> = ({
  form,
  formError,
  fieldErrors,
  isPending,
  onChange,
  onSubmit,
}) => (
  <div className="bg-gradient-to-br from-gray-900/60 via-gray-900/40 to-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
    <h2 className="text-lg font-semibold text-white mb-1">
      Professional Details
    </h2>
    <p className="text-sm text-gray-400 mb-5">
      Fill in your professional information to complete onboarding.
    </p>

    <FormError error={formError} className="mb-4" />

    <div className="space-y-4">
      {/* Professional Email */}
      <div>
        <label className={labelCls}>
          Professional Email <span className="text-gray-500">(optional)</span>
        </label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          placeholder="dr.name@hospital.com"
          className={inputCls}
        />
        <FieldErrorMessage message={fieldErrors.email} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gender */}
        <div>
          <label className={labelCls}>
            Gender <span className="text-red-400">*</span>
          </label>
          <select
            name="gender"
            value={form.gender}
            onChange={onChange}
            className={selectCls}
          >
            <option value="" className="bg-gray-800 text-gray-400">
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

        {/* Date of Birth */}
        <div>
          <label className={labelCls}>
            Date of Birth <span className="text-red-400">*</span>
          </label>
          <input
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={onChange}
            className={inputCls}
          />
          <FieldErrorMessage message={fieldErrors.dateOfBirth} />
        </div>
      </div>

      {/* Specialization */}
      <div>
        <label className={labelCls}>
          Specialization <span className="text-red-400">*</span>
        </label>
        <select
          name="specialization"
          value={form.specialization}
          onChange={onChange}
          className={selectCls}
        >
          <option value="" className="bg-gray-800 text-gray-400">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Qualification */}
        <div>
          <label className={labelCls}>
            Qualification <span className="text-red-400">*</span>
          </label>
          <input
            name="qualification"
            value={form.qualification}
            onChange={onChange}
            placeholder="e.g. MBBS, MD"
            className={inputCls}
          />
          <FieldErrorMessage message={fieldErrors.qualification} />
        </div>

        {/* Years of Experience */}
        <div>
          <label className={labelCls}>
            Years of Experience <span className="text-red-400">*</span>
          </label>
          <input
            name="yearsOfExperience"
            type="number"
            min={0}
            max={60}
            value={form.yearsOfExperience}
            onChange={onChange}
            placeholder="e.g. 5"
            className={inputCls}
          />
          <FieldErrorMessage message={fieldErrors.yearsOfExperience} />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className={labelCls}>
          Bio <span className="text-gray-500">(optional, max 250 chars)</span>
        </label>
        <textarea
          name="bio"
          value={form.bio}
          onChange={onChange}
          rows={3}
          maxLength={250}
          placeholder="Brief professional summary..."
          className={`${inputCls} resize-none`}
        />
        <div className="flex justify-between items-start mt-0.5">
          <FieldErrorMessage message={fieldErrors.bio} />
          <p className="text-xs text-gray-500 ml-auto">{form.bio.length}/250</p>
        </div>
      </div>

      {/* Languages Spoken */}
      <div>
        <label className={labelCls}>
          Languages Spoken{" "}
          <span className="text-gray-500">(comma-separated)</span>
        </label>
        <input
          name="languagesSpoken"
          value={form.languagesSpoken}
          onChange={onChange}
          placeholder="e.g. English, Hindi, Bengali"
          className={inputCls}
        />
      </div>
    </div>

    <button
      onClick={onSubmit}
      disabled={isPending}
      className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
    >
      {isPending ? <Spinner size="sm" /> : null}
      Continue
      {!isPending && <ChevronRight size={16} />}
    </button>
  </div>
);

export default OnboardingStep1Form;
