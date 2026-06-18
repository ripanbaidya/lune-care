import { AlertTriangle, Building2, Plus, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import Spinner from "../../../shared/components/ui/Spinner";
import { AppError } from "../../../shared/utils/errorParser";
import ClinicCard from "../components/clinic/ClinicCard";
import ClinicForm from "../components/clinic/ClinicForm";
import {
    useAddClinic,
    useDeleteClinic,
    useDoctorClinics,
    useUpdateClinic,
} from "../hooks/useDoctorClinics";
import {
    type ClinicResponse,
    type CreateClinicRequest,
    type UpdateClinicRequest,
} from "../types/doctor-clinic.types";

type PageMode = "view" | "create" | { editId: string };

const DoctorClinicsPage: React.FC = () => {
  const { data: clinicsRes, isLoading } = useDoctorClinics();
  const { mutate: addClinic, isPending: isAdding } = useAddClinic();
  const { mutate: updateClinic, isPending: isUpdating } = useUpdateClinic();
  const { mutate: deleteClinic, isPending: isDeleting } = useDeleteClinic();

  const clinics: ClinicResponse[] = clinicsRes?.data ?? [];

  const [mode, setMode] = useState<PageMode>("view");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTargetClinic, setDeleteTargetClinic] =
    useState<ClinicResponse | null>(null);

  const resetFormState = () => {
    setFormError(null);
    setFieldErrors({});
  };

  const handleCancel = () => {
    resetFormState();
    setMode("view");
  };

  const handleCreate = (data: CreateClinicRequest) => {
    resetFormState();
    addClinic(data, {
      onSuccess: () => {
        toast.success("Clinic added successfully");
        setMode("view");
      },
      onError: (err: AppError) => {
        if (err.isValidation) setFieldErrors(err.toFieldErrorMap());
        else setFormError(err.message);
      },
    });
  };

  const handleUpdate = (clinicId: string, data: CreateClinicRequest) => {
    resetFormState();

    // Strip empty strings and undefined — zero is intentionally excluded
    // (consultationFees cannot be 0 by business rule)
    const payload = Object.fromEntries(
      Object.entries(data).filter(
        ([, v]) => v !== "" && v !== undefined && v !== 0,
      ),
    ) as UpdateClinicRequest;

    updateClinic(
      { clinicId, data: payload },
      {
        onSuccess: () => {
          toast.success("Clinic updated successfully");
          setMode("view");
        },
        onError: (err: AppError) => {
          if (err.isValidation) setFieldErrors(err.toFieldErrorMap());
          else setFormError(err.message);
        },
      },
    );
  };

  const handleDeleteRequest = (clinic: ClinicResponse) => {
    setDeleteTargetClinic(clinic);
  };

  const handleDeleteCancel = () => {
    if (isDeleting && deletingId === deleteTargetClinic?.id) return;
    setDeleteTargetClinic(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetClinic) return;

    const clinicId = deleteTargetClinic.id;
    setDeletingId(clinicId);
    deleteClinic(clinicId, {
      onSuccess: () => {
        toast.success("Clinic removed");
        setDeletingId(null);
        setDeleteTargetClinic(null);
      },
      onError: (err: AppError) => {
        toast.error(err.message);
        setDeletingId(null);
        setDeleteTargetClinic(null);
      },
    });
  };

  const editingClinic =
    typeof mode === "object" ? clinics.find((c) => c.id === mode.editId) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clinics</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage your clinic locations
          </p>
        </div>
        {mode === "view" && (
          <button
            onClick={() => setMode("create")}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
          >
            <Plus size={14} />
            Add Clinic
          </button>
        )}
      </div>

      {/* Create form */}
      {mode === "create" && (
        <ClinicForm
          title="Add New Clinic"
          onSave={handleCreate}
          onCancel={handleCancel}
          isPending={isAdding}
          formError={formError}
          fieldErrors={fieldErrors}
        />
      )}

      {/* Edit form */}
      {typeof mode === "object" && editingClinic && (
        <ClinicForm
          title={`Edit — ${editingClinic.name}`}
          initial={{
            name: editingClinic.name,
            type: editingClinic.type,
            consultationFees: editingClinic.consultationFees,
            consultationDurationMinutes:
              editingClinic.consultationDurationMinutes,
            contactNumber: editingClinic.contactNumber ?? "",
            addressLine: editingClinic.addressLine,
            city: editingClinic.city,
            state: editingClinic.state,
            pincode: editingClinic.pincode,
            country: editingClinic.country,
          }}
          onSave={(data) => handleUpdate(editingClinic.id, data)}
          onCancel={handleCancel}
          isPending={isUpdating}
          formError={formError}
          fieldErrors={fieldErrors}
        />
      )}

      {/* Empty state */}
      {clinics.length === 0 && mode === "view" && (
        <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col items-center py-14 gap-3 shadow-md">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Building2 size={24} className="text-gray-500" />
          </div>
          <p className="text-sm text-gray-400">No clinics added yet</p>
          <button
            onClick={() => setMode("create")}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
          >
            <Plus size={14} />
            Add Your First Clinic
          </button>
        </div>
      )}

      {/* Clinics list — hide card being edited to avoid showing stale data */}
      <div className="space-y-4">
        {clinics.map((clinic) => {
          const isBeingEdited =
            typeof mode === "object" && mode.editId === clinic.id;
          if (isBeingEdited) return null;

          return (
            <ClinicCard
              key={clinic.id}
              clinic={clinic}
              onEdit={() => {
                resetFormState();
                setMode({ editId: clinic.id });
              }}
              onDelete={() => handleDeleteRequest(clinic)}
              isDeleting={isDeleting && deletingId === clinic.id}
            />
          );
        })}
      </div>

      {deleteTargetClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-gradient-to-b from-gray-900 to-black shadow-2xl">
            <div className="px-6 pt-5 pb-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Remove {deleteTargetClinic.name}?
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
                disabled={isDeleting && deletingId === deleteTargetClinic.id}
                className="px-4 py-2 text-sm rounded-lg border border-gray-700/70 text-gray-300 hover:bg-gray-800/60 transition-colors disabled:opacity-50"
              >
                No, Keep It
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting && deletingId === deleteTargetClinic.id}
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

export default DoctorClinicsPage;
