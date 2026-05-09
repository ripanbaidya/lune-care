import React from "react";
import { FormError } from "../../../../shared/components/ui/FormError";
import { FieldErrorMessage } from "../../../../shared/components/ui/FieldErrorMessage";
import type { AddressRequest } from "../../types/patient.address.types";

interface AddressFormProps {
  form: AddressRequest;
  fieldErrors: Record<string, string>;
  formError: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  form,
  fieldErrors,
  formError,
  onChange,
}) => {
  return (
    <div className="space-y-5">
      <FormError error={formError} />

      {/* Address Line */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-300">
          Address Line <span className="text-red-400">*</span>
        </label>
        <input
          name="addressLine"
          value={form.addressLine}
          onChange={onChange}
          placeholder="Street, Building, Area"
          className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
        />
        <FieldErrorMessage message={fieldErrors.addressLine} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* City */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300">
            City <span className="text-red-400">*</span>
          </label>
          <input
            name="city"
            value={form.city}
            onChange={onChange}
            placeholder="City"
            className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
          />
          <FieldErrorMessage message={fieldErrors.city} />
        </div>

        {/* State */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300">
            State <span className="text-red-400">*</span>
          </label>
          <input
            name="state"
            value={form.state}
            onChange={onChange}
            placeholder="State"
            className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
          />
          <FieldErrorMessage message={fieldErrors.state} />
        </div>

        {/* PIN Code */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300">
            PIN Code <span className="text-red-400">*</span>
          </label>
          <input
            name="pinCode"
            value={form.pinCode}
            onChange={onChange}
            placeholder="6-digit PIN"
            maxLength={6}
            className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
          />
          <FieldErrorMessage message={fieldErrors.pinCode} />
        </div>

        {/* Country */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-300">
            Country <span className="text-red-400">*</span>
          </label>
          <input
            name="country"
            value={form.country}
            onChange={onChange}
            placeholder="Country"
            className="w-full px-4 py-3 bg-gray-950/50 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-950 transition-all duration-200 hover:border-gray-600/50"
          />
          <FieldErrorMessage message={fieldErrors.country} />
        </div>
      </div>
    </div>
  );
};
