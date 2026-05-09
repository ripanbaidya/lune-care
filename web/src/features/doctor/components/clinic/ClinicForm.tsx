import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { FormError } from "../../../../shared/components/ui/FormError";
import { FieldErrorMessage } from "../../../../shared/components/ui/FieldErrorMessage";
import Spinner from "../../../../shared/components/ui/Spinner";
import {
  CLINIC_TYPE_LABELS,
  type CreateClinicRequest,
} from "../../types/doctor-clinic.types";

const CLINIC_TYPES = [
  "IN_PERSON",
  "ONLINE",
  "PRIVATE_CLINIC",
  "HOSPITAL",
  "CLINIC",
] as const;

export const EMPTY_CLINIC_FORM: CreateClinicRequest = {
  name: "",
  type: "IN_PERSON",
  consultationFees: "" as unknown as number, // empty so placeholder shows; cast satisfies TS type
  consultationDurationMinutes: 30,
  contactNumber: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

const inputCls =
  "w-full px-4 py-2.5 border border-gray-600 rounded-lg text-sm text-white bg-gray-800/50 " +
  "placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
  "transition-all duration-200 hover:border-gray-500";

const selectCls =
  "w-full px-4 py-2.5 border border-gray-600 rounded-lg text-sm text-white bg-gray-800/50 " +
  "outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
  "transition-all duration-200 hover:border-gray-500";

const labelCls = "block text-xs font-medium text-gray-300 mb-2";

interface ClinicFormProps {
  title: string;
  initial?: CreateClinicRequest;
  onSave: (data: CreateClinicRequest) => void;
  onCancel: () => void;
  isPending: boolean;
  formError: string | null;
  fieldErrors: Record<string, string>;
}

const ClinicForm: React.FC<ClinicFormProps> = ({
  title,
  initial = EMPTY_CLINIC_FORM,
  onSave,
  onCancel,
  isPending,
  formError,
  fieldErrors,
}) => {
  const [form, setForm] = useState<CreateClinicRequest>(initial);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const isNumeric =
      name === "consultationFees" || name === "consultationDurationMinutes";
    setForm((prev) => ({
      ...prev,
      // Preserve empty string when user clears field — Number('') === 0 re-introduces zero-prefix bug
      [name]: isNumeric
        ? value === ""
          ? ("" as unknown as number)
          : Number(value)
        : value,
    }));
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/30 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl px-6 py-6">
      <p className="text-sm font-semibold text-gray-100 mb-4">{title}</p>
      <FormError error={formError} className="mb-4" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Clinic Name — full width */}
        <div className="sm:col-span-2">
          <label className={labelCls}>
            Clinic Name <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. GreenLife Health Center"
            className={inputCls}
          />
          <FieldErrorMessage message={fieldErrors.name} />
        </div>

        {/* Clinic Type */}
        <div>
          <label className={labelCls}>
            Clinic Type <span className="text-red-400">*</span>
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className={selectCls}
          >
            {CLINIC_TYPES.map((t) => (
              <option key={t} value={t} className="bg-gray-800 text-white">
                {CLINIC_TYPE_LABELS[t] || t}
              </option>
            ))}
          </select>
          <FieldErrorMessage message={fieldErrors.type} />
        </div>

        {/* Contact Number */}
        <div>
          <label className={labelCls}>Contact Number</label>
          <input
            name="contactNumber"
            value={form.contactNumber ?? ""}
            onChange={handleChange}
            placeholder="10-digit number"
            className={inputCls}
          />
          <FieldErrorMessage message={fieldErrors.contactNumber} />
        </div>

        {/* Consultation Fees */}
        <div>
          <label className={labelCls}>
            Consultation Fees (₹) <span className="text-red-400">*</span>
          </label>
          <input
            name="consultationFees"
            type="number"
            min={1}
            value={form.consultationFees}
            onChange={handleChange}
            placeholder="500"
            className={inputCls}
          />
          <FieldErrorMessage message={fieldErrors.consultationFees} />
        </div>

        {/* Duration */}
        <div>
          <label className={labelCls}>
            Duration (minutes) <span className="text-red-400">*</span>
          </label>
          <input
            name="consultationDurationMinutes"
            type="number"
            min={10}
            max={120}
            value={form.consultationDurationMinutes}
            onChange={handleChange}
            className={inputCls}
          />
          <FieldErrorMessage
            message={fieldErrors.consultationDurationMinutes}
          />
        </div>

        {/* Address Line — full width */}
        <div className="sm:col-span-2">
          <label className={labelCls}>
            Address Line <span className="text-red-400">*</span>
          </label>
          <input
            name="addressLine"
            value={form.addressLine}
            onChange={handleChange}
            placeholder="Street, Building, Area"
            className={inputCls}
          />
          <FieldErrorMessage message={fieldErrors.addressLine} />
        </div>

        {/* City */}
        <div>
          <label className={labelCls}>
            City <span className="text-red-400">*</span>
          </label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="City"
            className={inputCls}
          />
          <FieldErrorMessage message={fieldErrors.city} />
        </div>

        {/* State */}
        <div>
          <label className={labelCls}>
            State <span className="text-red-400">*</span>
          </label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="State"
            className={inputCls}
          />
          <FieldErrorMessage message={fieldErrors.state} />
        </div>

        {/* PIN Code */}
        <div>
          <label className={labelCls}>
            PIN Code <span className="text-red-400">*</span>
          </label>
          <input
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            placeholder="6-digit PIN"
            maxLength={6}
            className={inputCls}
          />
          <FieldErrorMessage message={fieldErrors.pincode} />
        </div>

        {/* Country */}
        <div>
          <label className={labelCls}>Country</label>
          <input
            name="country"
            value={form.country ?? ""}
            onChange={handleChange}
            placeholder="Country"
            className={inputCls}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-gray-200 text-sm rounded-lg transition-all duration-200 hover:bg-gray-800/50"
        >
          <X size={14} /> Cancel
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={isPending}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isPending ? <Spinner size="sm" /> : <Check size={14} />}
          Save Clinic
        </button>
      </div>
    </div>
  );
};

export default ClinicForm;
