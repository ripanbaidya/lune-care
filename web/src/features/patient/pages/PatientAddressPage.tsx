import React, { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleDeleteRequest = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteCancel = () => {
    if (isDeleting) return;
    setShowDeleteDialog(false);
  };

  const handleDeleteConfirm = () => {
    deleteAddress(undefined, {
      onSuccess: () => {
        toast.success("Address removed");
        setForm(EMPTY_ADDRESS);
        setMode("view");
        setShowDeleteDialog(false);
      },
      onError: (err: AppError) => {
        toast.error(err.message);
        setShowDeleteDialog(false);
      },
    });
  };

  const handleEdit = () => {
    if (address) {
      setForm({
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
        country: address.country,
      });
    }
    setMode("edit");
  };

  const handleAdd = () => {
    setForm(EMPTY_ADDRESS);
    setMode("create");
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
        onEdit={handleEdit}
        onAdd={handleAdd}
        onCancel={handleCancel}
        onSave={handleSave}
      />

      {/* Main Card */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 px-6 py-6">
        {/* Empty state */}
        {!hasAddress && !isFormMode && (
          <AddressEmpty onAdd={handleAdd} />
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
            onDelete={handleDeleteRequest}
          />
        )}
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-gradient-to-b from-gray-900 to-black shadow-2xl">
            <div className="px-6 pt-5 pb-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Remove Saved Address?
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="ml-auto p-1.5 text-gray-600 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 pb-5 pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="px-4 py-2 text-sm rounded-lg border border-gray-700/70 text-gray-300 hover:bg-gray-800/60 transition-colors disabled:opacity-50"
              >
                No, Keep It
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAddressPage;
