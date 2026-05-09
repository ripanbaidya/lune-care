import React, { useState, useEffect } from "react";
import {
  usePatientAddress,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "../hooks/usePatientAddress";
import Spinner from "../../../shared/components/ui/Spinner";
import { AddressHeader } from "../components/address/AddressHeader";
import { AddressForm } from "../components/address/AddressForm";
import { AddressDisplay } from "../components/address/AddressDisplay";
import { AddressEmpty } from "../components/address/AddressEmpty";
import type { AddressRequest } from "../types/patient-address.types";
import { AppError } from "../../../shared/utils/errorParser";
import { toast } from "sonner";

const EMPTY_ADDRESS: AddressRequest = {
  addressLine: "",
  city: "",
  state: "",
  pinCode: "",
  country: "",
};

const PatientAddressPage: React.FC = () => {
  const { data: addressRes, isLoading } = usePatientAddress();
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();

  const address = addressRes?.data ?? null;
  const hasAddress = !!address;

  const [mode, setMode] = useState<"view" | "edit" | "create">("view");
  const [form, setForm] = useState<AddressRequest>(EMPTY_ADDRESS);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Sync form when address data loads
  useEffect(() => {
    if (address) {
      setForm({
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
        country: address.country,
      });
    }
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.addressLine.trim())
      errors.addressLine = "Address line is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.state.trim()) errors.state = "State is required";
    if (!form.pinCode.trim()) errors.pinCode = "PIN code is required";
    if (!form.country.trim()) errors.country = "Country is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    setFormError(null);
    if (!validate()) return;

    const onSuccess = () => {
      toast.success(hasAddress ? "Address updated" : "Address saved");
      setMode("view");
    };
    const onError = (err: AppError) => {
      if (err.isValidation) setFieldErrors(err.toFieldErrorMap());
      else setFormError(err.message);
    };

    if (mode === "create") {
      createAddress(form, { onSuccess, onError });
    } else {
      updateAddress(form, { onSuccess, onError });
    }
  };

  const handleDelete = () => {
    if (!window.confirm("Remove your saved address?")) return;
    deleteAddress(undefined, {
      onSuccess: () => {
        toast.success("Address removed");
        setForm(EMPTY_ADDRESS);
        setMode("view");
      },
      onError: (err: AppError) => toast.error(err.message),
    });
  };

  const handleCancel = () => {
    setFormError(null);
    setFieldErrors({});
    if (address) {
      setForm({
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
        country: address.country,
      });
    } else {
      setForm(EMPTY_ADDRESS);
    }
    setMode("view");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" />
      </div>
    );
  }

  const isPending = isCreating || isUpdating;
  const isFormMode = mode === "edit" || mode === "create";

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <AddressHeader
        hasAddress={hasAddress}
        isFormMode={isFormMode}
        isPending={isPending}
        onEdit={() => setMode("edit")}
        onAdd={() => setMode("create")}
        onCancel={handleCancel}
        onSave={handleSave}
      />

      {/* Main Card */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 px-6 py-6">
        {/* Empty state */}
        {!hasAddress && !isFormMode && (
          <AddressEmpty onAdd={() => setMode("create")} />
        )}

        {/* Form mode */}
        {isFormMode && (
          <AddressForm
            form={form}
            fieldErrors={fieldErrors}
            formError={formError}
            onChange={handleChange}
          />
        )}

        {/* View mode - address exists */}
        {hasAddress && !isFormMode && address && (
          <AddressDisplay
            address={address}
            isDeleting={isDeleting}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default PatientAddressPage;
